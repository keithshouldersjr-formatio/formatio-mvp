import { NextResponse } from "next/server";
import OpenAI from "openai";
import { IntakeSchema, PlaybookSchema } from "@/lib/schema";
import { buildPlaybookPrompt } from "@/lib/prompt";
import { savePlaybook } from "@/lib/store";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Safely removes markdown code fences if the model wraps JSON in ```json blocks
 */
function safeJsonParse(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function POST(req: Request) {
  try {
    // Parse and validate incoming form data
    const body = await req.json();
    const intake = IntakeSchema.parse(body);

    // Call OpenAI
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: buildPlaybookPrompt(intake),
    });

    const text = response.output_text?.trim();

    if (!text) {
      throw new Error("No output returned from model.");
    }

    // Parse AI JSON safely
    const json = safeJsonParse(text);

    // Validate the generated playbook structure
    const playbook = PlaybookSchema.parse(json);

    // Save to in-memory store
    const id = savePlaybook(playbook);

    return NextResponse.json({
      id,
      playbook,
    });

  } catch (err: unknown) {
    console.error("Playbook generation error:", err);

    let message = "Unexpected error occurred.";

    if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}