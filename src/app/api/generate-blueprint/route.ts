// src/app/api/generate-blueprint/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { IntakeSchema, BlueprintSchema } from "@/lib/schema";
import { buildBlueprintPrompt } from "@/lib/prompt";
import { insertBlueprint } from "@/lib/blueprint-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrBody = { error: string; stage?: string; details?: unknown; raw?: string };

function err(status: number, body: ErrBody) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    console.log(`[generate-blueprint] start requestId=${requestId}`);

    // 1) Parse body
    const body = (await req.json()) as unknown;
    console.log(`[generate-blueprint] parsed body requestId=${requestId}`);

    // 2) Validate intake
    const intakeRes = IntakeSchema.safeParse(body);
    if (!intakeRes.success) {
      console.error(
        `[generate-blueprint] intake invalid requestId=${requestId}`,
        intakeRes.error.flatten(),
      );
      return err(400, {
        error: "Invalid intake.",
        stage: "intake-validate",
        details: intakeRes.error.flatten(),
      });
    }
    const intake = intakeRes.data;

    // 3) Build prompt
    const prompt = buildBlueprintPrompt(intake);
    console.log(`[generate-blueprint] prompt built requestId=${requestId}`);

    // 4) OpenAI call
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error(`[generate-blueprint] missing OPENAI_API_KEY requestId=${requestId}`);
      return err(500, { error: "Server misconfigured: OPENAI_API_KEY missing.", stage: "config" });
    }

    const client = new OpenAI({ apiKey });

    console.log(`[generate-blueprint] calling openai requestId=${requestId}`);
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON. No markdown. No commentary. Return a single JSON object.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    if (!raw.trim()) {
      console.error(
        `[generate-blueprint] openai empty requestId=${requestId}`,
        completion,
      );
      return err(502, { error: "Model returned empty output.", stage: "openai" });
    }

    // 5) Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error(
        `[generate-blueprint] json parse failed requestId=${requestId}`,
        e,
      );
      return err(502, {
        error: "Model returned invalid JSON.",
        stage: "json-parse",
        raw: raw.slice(0, 4000),
      });
    }

    // 6) Validate schema
    const schemaRes = BlueprintSchema.safeParse(parsed);
    if (!schemaRes.success) {
      const flat = schemaRes.error.flatten();
      console.error(
        `[generate-blueprint] schema validation failed requestId=${requestId}`,
        flat,
      );
      return err(502, {
        error: "Blueprint schema validation failed.",
        stage: "schema-validate",
        details: flat,
        raw: raw.slice(0, 4000),
      });
    }
    const blueprint = schemaRes.data;

    // 7) Insert
    console.log(`[generate-blueprint] inserting requestId=${requestId}`);
    const id = await insertBlueprint(intake, blueprint);

    console.log(`[generate-blueprint] success id=${id} requestId=${requestId}`);
    return NextResponse.json({ id });
  } catch (e) {
    console.error(`[generate-blueprint] unhandled requestId=${requestId}`, e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return err(500, { error: message, stage: "unhandled" });
  }
}