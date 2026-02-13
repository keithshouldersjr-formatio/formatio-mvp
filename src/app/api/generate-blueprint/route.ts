import { NextResponse } from "next/server";
import OpenAI from "openai";
import { IntakeSchema, BlueprintSchema } from "@/lib/schema";
import { buildBlueprintPrompt } from "@/lib/prompt";
import { insertBlueprint } from "@/lib/blueprint-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate intake
    const intake = IntakeSchema.parse(body);

    // Build prompt
    const prompt = buildBlueprintPrompt(intake);

    // Call OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(content);

    // Validate blueprint output
    const blueprint = BlueprintSchema.parse(parsed);

    // Persist (ties to user_id inside insertBlueprint)
    const id = await insertBlueprint(intake, blueprint);

    return NextResponse.json({ id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}