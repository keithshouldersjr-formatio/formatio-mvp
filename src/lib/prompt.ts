// src/lib/prompt.ts
import type { Intake } from "@/lib/schema";
import { DBD_METHOD } from "@/lib/methodology";

function formatMethodologyForPrompt() {
  const convictions = DBD_METHOD.coreConvictions.map((c) => `- ${c}`).join("\n");

  const inform = DBD_METHOD.movements.inform;
  const inspire = DBD_METHOD.movements.inspire;
  const involve = DBD_METHOD.movements.involve;

  return `
The Discipleship by Design Method (MANDATORY):

Core Convictions:
${convictions}

Three Movements of Every Lesson:
1) Inform — Clarify truth.
   Bloom: ${inform.bloomLevels.join(", ")}
   Summary: ${inform.summary}

2) Inspire — Connect truth to life.
   Bloom: ${inspire.bloomLevels.join(", ")}
   Summary: ${inspire.summary}

3) Involve — Involve learners through activity + creativity.
   Bloom: ${involve.bloomLevels.join(", ")}
   Summary: ${involve.summary}

Three Dimensions of Objective (for every lesson/session):
- Head — ${DBD_METHOD.objectiveDimensions.head}
- Heart — ${DBD_METHOD.objectiveDimensions.heart}
- Hands — ${DBD_METHOD.objectiveDimensions.hands}

Structural requirements (non-negotiable):
- Use Head/Heart/Hands language for objectives.
- Use Inform/Inspire/Involve language for engagement.
- Every session must include:
  - objectives: { head, heart, hands }
  - engagement: { inform[], inspire[], involve[] }
  - flow[] with minutes + movement tags (Inform/Inspire/Involve)
- Use simple, volunteer-friendly language (no academic jargon).
- Keep it tight. Avoid fluff, filler, or long inspirational paragraphs.
`.trim();
}

function roleGuidance(role: Intake["role"]) {
  if (role === "Pastor/Leader") {
    return `
ROLE TUNING (Pastor/Leader):
- Assume you are equipping leaders AND possibly facilitating the session.
- Keep teacher-facing instructions simple.
- Add alignmentNotes (3–5 bullets) inside pastorLeader.planOverview.
- Add measurementFramework that matches "How To Measure Growth" (simple + usable).
- Add ONE leader training session (30–45 min) that helps someone else run this session.
`.trim();
  }

  if (role === "Youth Leader") {
    return `
ROLE TUNING (Youth Leader):
- Assume students need movement, variety, and clear instructions.
- Involve MUST include at least one activity with:
  - a clear prompt
  - a tangible output (poster, response card, short roleplay, etc.)
- Flow should include transitions and time-boxed segments to keep energy focused.
`.trim();
  }

  // Default: Teacher
  return `
ROLE TUNING (Teacher):
- Assume a volunteer teacher leading one session.
- Give clear “what to say / what to ask / what to do” prompts.
- Engagement bullets must be concrete examples tied to the topic/outcome.
- Keep prep minimal and realistic (4–8 checklist items).
- Include exactly ONE weekly practice step reflected in:
  - hands objective AND
  - the Involve engagement bullets.
`.trim();
}

function durationToMinutes(intake: Intake): number {
  if (intake.duration === "Custom" && typeof intake.durationCustomMinutes === "number") {
    return intake.durationCustomMinutes;
  }
  if (intake.duration === "45–60 min") return 60;
  if (intake.duration === "75–90 min") return 90;
  return 60;
}

export function buildBlueprintPrompt(intake: Intake) {
  const role = intake.role ?? "Teacher";
  const designType = "Single Lesson";
  const timeHorizon = "Single Session";
  const durationMinutes = durationToMinutes(intake);

  const constraints = intake.constraints?.length
    ? intake.constraints.slice(0, 2).join("; ")
    : "None provided";

  const setting = `${intake.setting}${intake.settingDetail ? ` (${intake.settingDetail})` : ""}`;
  const topicOrText = intake.topicOrText?.trim() ? intake.topicOrText.trim() : "";

  return `
You are generating a discipleship blueprint for Discipleship by Design.
Audience: volunteer leaders and teachers with little-to-no formal training in education.
Goal: ONE single-session plan that is spiritually faithful, realistic to execute, and clearly measurable.

${formatMethodologyForPrompt()}

Non-negotiable design principles:
1) Backwards Design (do NOT skip this):
   - Begin with a clear Formation Goal (1–2 sentences).
   - Define How To Measure Growth (3–6 observable indicators).
   - Define Head/Heart/Hands objectives (each 1 sentence max).
   - Then build ONE session that intentionally moves Inform → Inspire → Involve.

2) Realism & Feasibility:
   - This is ONE session only (no curriculum, no multi-week plans).
   - Flow segment minutes MUST sum to ${durationMinutes}.
   - Keep prep achievable for volunteers with limited time.
   - Assume some learners have low Bible literacy; explain simply.

3) Constraints must shape decisions:
   - Adapt pacing, explanations, and activities to the top 1–2 constraints.
   - The plan should feel designed around the constraints (not generic).

Inform / Inspire / Involve content rules (VERY IMPORTANT):
- These are NOT theory statements.
- Each movement must include 2–5 bullets of concrete prompts a leader can actually do:
  - what to say (1–2 sentence script),
  - what to ask (a question),
  - what to do (a mini-activity or structure),
  all tied directly to the Desired Outcome + Topic/Text.

${roleGuidance(role)}

Now generate the blueprint using the intake details below:

Role: ${role}
Design Type: ${designType}
Time Horizon: ${timeHorizon}

Audience Age Group: ${intake.ageGroup}
Group Name: ${intake.groupName}
Leader Name: ${intake.leaderName ?? "Not provided"}

Setting: ${setting}
Session Length: ${durationMinutes} minutes

Desired Outcome (formation intent): ${intake.desiredOutcome}
Topic/Text: ${topicOrText}

Top Constraints (max 2): ${constraints}

OUTPUT FORMAT RULES (STRICT):
- Return ONLY valid JSON (no markdown/backticks/commentary).
- Root keys must be exactly: header, overview, modules, recommendedResources
- JSON must match this exact shape and key names:

{
  "header": {
    "title": "string",
    "subtitle": "string (optional)",
    "role": "Teacher | Pastor/Leader | Youth Leader",
    "preparedFor": { "leaderName": "string", "groupName": "string" },
    "context": {
      "designType": "Single Lesson",
      "timeHorizon": "Single Session",
      "ageGroup": "string",
      "setting": "string",
      "durationMinutes": ${durationMinutes},
      "topicOrText": "string",
      "constraints": ["string", "string"]
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
      "planType": "Single Session",
      "sessions": [
        {
          "title": "string",
          "durationMinutes": number,
          "objectives": { "head": "string", "heart": "string", "hands": "string" },
          "engagement": {
            "inform": ["string"],
            "inspire": ["string"],
            "involve": ["string"]
          },
          "flow": [
            { "segment": "string", "minutes": number, "purpose": "string", "movement": "Inform|Inspire|Involve" }
          ]
        }
      ]
    }
  }
},
  "recommendedResources": [
    { "title": "string", "author": "string", "publisher": "string", "amazonUrl": "string", "publisherUrl": "string", "whyThisHelps": "string" }
  ]
}

Hard rules:
- Root keys must be exactly: header, overview, modules, recommendedResources
- header.context.designType MUST be "Single Lesson"
- header.context.timeHorizon MUST be "Single Session"
- header.context.durationMinutes MUST be ${durationMinutes}
- Always include modules.teacher (even if role is Pastor/Leader or Youth Leader).
- Do NOT include modules.pastorLeader or modules.youthLeader in this version.
- If role is Pastor/Leader, include modules.pastorLeader and omit youthLeader.
- If role is Youth Leader, include modules.youthLeader and omit pastorLeader.
- modules.teacher.prepChecklist must be ONE list (4–8 items).
- lessonPlan.planType MUST be "Single Session"
- sessions MUST contain exactly 1 session object.
- overview.outcomes.howToMeasureGrowth MUST be 3–6 observable indicators.
- Do NOT include executiveSummary.
- Do NOT include followUpPlan.
- Every flow item must include movement = Inform|Inspire|Involve.
- Flow minutes must sum to ${durationMinutes}.
- Keep writing short and practical:
  - formationGoal: 1–2 sentences max
  - each objective: 1 sentence max
  - engagement bullets: 2–5 per movement, concrete and actionable
`.trim();
}