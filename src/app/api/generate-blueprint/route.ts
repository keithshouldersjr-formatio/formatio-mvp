// src/app/api/generate-blueprint/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  IntakeSchema,
  BlueprintSchema,
  type Intake,
  type Blueprint,
} from "@/lib/schema";
import { buildBlueprintPrompt } from "@/lib/prompt";
import { supabaseRoute } from "@/lib/supabase-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrBody = {
  error: string;
  stage?: string;
  details?: unknown;
  raw?: string;
  candidateKeys?: string[];
};

const err = (status: number, body: ErrBody) =>
  NextResponse.json(body, { status });

function unwrapBlueprintCandidate(v: unknown): unknown {
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }

  if (typeof v !== "object" || v === null) return v;

  const obj = v as Record<string, unknown>;
  if (typeof obj.blueprint === "object" && obj.blueprint !== null)
    return obj.blueprint;
  if (typeof obj.data === "object" && obj.data !== null) return obj.data;
  if (typeof obj.result === "object" && obj.result !== null) return obj.result;

  return v;
}

function safeKeys(v: unknown): string[] | undefined {
  return typeof v === "object" && v !== null
    ? Object.keys(v as Record<string, unknown>).slice(0, 40)
    : undefined;
}

async function callModel(client: OpenAI, prompt: string) {
  return client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "Return ONLY valid JSON. No markdown. No commentary. No backticks. A single JSON object only.",
      },
      { role: "user", content: prompt },
    ],
  });
}

/**
 * Repair prompt aligned to your CURRENT schema:
 * - overview.outcomes.howToMeasureGrowth
 * - overview.executiveSummary removed
 * - modules.teacher.prepChecklist is string[]
 * - modules.teacher.followUpPlan removed
 * - flow items REQUIRE movement
 */
function buildRepairPrompt(args: { flatErrors: unknown; badJsonRaw: string }) {
  const { flatErrors, badJsonRaw } = args;

  return `
Fix the JSON to match the REQUIRED schema EXACTLY. Return ONLY the corrected JSON object.

IMPORTANT:
- Use volunteer-friendly language (simple, practical, no academic jargon).
- Discipleship by Design method is mandatory:
  - Each session includes objectives: head, heart, hands.
  - Each session includes engagement: inform, inspire, involve.
  - Each flow item MUST include movement: Inform | Inspire | Involve.
  - Flow minutes MUST sum to session durationMinutes.

REQUIRED ROOT KEYS (exactly these, no extra):
- header
- overview
- modules
- recommendedResources

REQUIRED SHAPE (keys must match exactly):

{
  "header": {
    "title": "string",
    "subtitle": "string (optional)",
    "role": "Teacher | Pastor/Leader | Youth Leader",
    "preparedFor": { "leaderName": "string", "groupName": "string" },
    "context": {
      "designType": "Single Lesson | Multi-Week Series | Quarter Curriculum",
      "timeHorizon": "string",
      "ageGroup": "string",
      "setting": "string",
      "durationMinutes": number,
      "topicOrText": "string",
      "constraints": ["string"]
    }
  },
  "overview": {
    "outcomes": {
      "formationGoal": "string",
      "howToMeasureGrowth": ["string", "..."]
    },
    "headHeartHandsObjectives": {
      "head": "string",
      "heart": "string",
      "hands": "string"
    }
  },
  "modules": {
    "teacher": {
      "prepChecklist": ["string", "..."],
      "lessonPlan": {
        "planType": "Single Session|Multi-Session|Quarter/Semester",
        "sessions": [
          {
            "title": "string",
            "durationMinutes": number,
            "objectives": { "head": "string", "heart": "string", "hands": "string" },
            "engagement": {
              "inform": ["string", "..."],
              "inspire": ["string", "..."],
              "involve": ["string", "..."]
            },
            "flow": [
              { "segment": "string", "minutes": number, "purpose": "string", "movement": "Inform|Inspire|Involve" }
            ]
          }
        ]
      }
    },
    "pastorLeader": "omit unless role is Pastor/Leader",
    "youthLeader": "omit unless role is Youth Leader"
  },
  "recommendedResources": [
    { "title": "string", "author": "string", "publisher": "string", "amazonUrl": "string", "publisherUrl": "string", "whyThisHelps": "string" }
  ]
}

HARD RULES:
- Output ONLY a single JSON object. No wrapper keys like { "blueprint": ... }.
- Do NOT include overview.executiveSummary.
- Do NOT include overview.outcomes.measurableIndicators.
- Do NOT include modules.teacher.followUpPlan.
- Do NOT include modules.teacher.prepChecklist.beforeTheWeek/dayOf.
- modules.teacher MUST be an OBJECT (not an array).
- sessions MUST be an array of objects.
- flow MUST be an array; each item must include movement.
- flow minutes MUST sum to durationMinutes.

Validation errors you must fix:
${JSON.stringify(flatErrors, null, 2)}

Bad JSON you produced:
${badJsonRaw}
`.trim();
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    // 1) Auth check (user context)
    const supabase = await supabaseRoute();
    const { data: userRes, error: userErr } = await supabase.auth.getUser();

    if (userErr) {
      console.error(
        `[generate-blueprint] auth error requestId=${requestId}`,
        userErr,
      );
      return err(401, { error: "Unauthorized", stage: "auth" });
    }
    if (!userRes.user) return err(401, { error: "Unauthorized", stage: "auth" });

    const userId = userRes.user.id;

    // 2) Validate intake
    const body: unknown = await req.json();
    const intakeRes = IntakeSchema.safeParse(body);
    if (!intakeRes.success) {
      return err(400, {
        error: "Invalid intake.",
        stage: "intake-validate",
        details: intakeRes.error.flatten(),
      });
    }
    const intake: Intake = intakeRes.data;

    // 2b) Normalize derived fields (single-session assumptions)
    // NOTE: topicOrText is optional in intake but required in blueprint.header.context,
    // so we normalize it to "" if missing (prompt will still have it).
    const intakeNormalized: Intake = {
      ...intake,
      role: intake.role ?? "Teacher",
      designType: "Single Lesson",
      timeHorizon: "Single Session",
      topicOrText: intake.topicOrText ?? "",
    };

    // 3) Prompt
    const prompt = buildBlueprintPrompt(intakeNormalized);

    // 4) OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
      return err(500, { error: "OPENAI_API_KEY missing.", stage: "config" });

    const client = new OpenAI({ apiKey });

    // 5) Generate
    const completion = await callModel(client, prompt);
    const raw = completion.choices?.[0]?.message?.content ?? "";
    if (!raw.trim())
      return err(502, { error: "Model returned empty output.", stage: "openai" });

    // 6) Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return err(502, {
        error: "Model returned invalid JSON.",
        stage: "json-parse",
        raw: raw.slice(0, 4000),
      });
    }

    // 7) Unwrap + Validate schema
    const candidate = unwrapBlueprintCandidate(parsed);
    const schemaRes = BlueprintSchema.safeParse(candidate);

    // 8) If schema fails, attempt one repair pass
    let blueprint: Blueprint;

    if (!schemaRes.success) {
      const flat = schemaRes.error.flatten();
      const candidateKeys = safeKeys(candidate);

      console.error(
        `[generate-blueprint] schema failed requestId=${requestId}`,
        flat,
      );
      console.error(
        `[generate-blueprint] candidate keys requestId=${requestId}`,
        candidateKeys,
      );
      console.error(
        `[generate-blueprint] raw (first 4000) requestId=${requestId}\n`,
        raw.slice(0, 4000),
      );

      const repairPrompt = buildRepairPrompt({
        flatErrors: flat,
        badJsonRaw: raw,
      });

      const repair = await callModel(client, repairPrompt);
      const raw2 = repair.choices?.[0]?.message?.content ?? "";
      if (!raw2.trim()) {
        return err(502, {
          error: "Model repair returned empty output.",
          stage: "openai-repair-empty",
          details: flat,
          raw: raw.slice(0, 4000),
          candidateKeys,
        });
      }

      let parsed2: unknown;
      try {
        parsed2 = JSON.parse(raw2);
      } catch {
        return err(502, {
          error: "Model repair returned invalid JSON.",
          stage: "json-parse-repair",
          details: flat,
          raw: raw2.slice(0, 4000),
        });
      }

      const candidate2 = unwrapBlueprintCandidate(parsed2);
      const schemaRes2 = BlueprintSchema.safeParse(candidate2);

      if (!schemaRes2.success) {
        const flat2 = schemaRes2.error.flatten();
        console.error(
          `[generate-blueprint] schema failed after repair requestId=${requestId}`,
          flat2,
        );
        console.error(
          `[generate-blueprint] raw repair (first 4000) requestId=${requestId}\n`,
          raw2.slice(0, 4000),
        );

        return err(502, {
          error: "Blueprint schema validation failed (after repair).",
          stage: "schema-validate-repair",
          details: flat2,
          raw: raw2.slice(0, 4000),
          candidateKeys: safeKeys(candidate2),
        });
      }

      blueprint = schemaRes2.data;
    } else {
      blueprint = schemaRes.data;
    }

    // 9) Insert using authed supabase client (RLS-safe)
    const { data, error } = await supabase
      .from("blueprints")
      .insert({
        user_id: userId,
        intake: intakeNormalized,
        blueprint,
        title: blueprint.header.title,
        role: blueprint.header.role,
        group_name: blueprint.header.preparedFor.groupName,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        `[generate-blueprint] insert failed requestId=${requestId}`,
        error,
      );
      return err(500, {
        error: error.message,
        stage: "insert",
      });
    }

    return NextResponse.json({ id: data.id });
  } catch (e: unknown) {
    console.error(`[generate-blueprint] unhandled requestId=${requestId}`, e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return err(500, { error: message, stage: "unhandled" });
  }
}