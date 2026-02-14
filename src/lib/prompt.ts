// src/lib/prompt.ts
import type { Intake } from "@/lib/schema";
import {
  deriveRoleFromTask,
  deriveDesignTypeFromTask,
  defaultTimeHorizon,
  requiresTimeHorizon,
} from "@/lib/intake";

export function buildBlueprintPrompt(intake: Intake) {
  const role = intake.role ?? deriveRoleFromTask(intake.task);
  const designType = intake.designType ?? deriveDesignTypeFromTask(intake.task);

  // ✅ Fix: only include time horizon when task requires it
  const timeHorizon =
    intake.timeHorizon ??
    (requiresTimeHorizon(intake.task) ? defaultTimeHorizon(intake.task) : undefined);

  const constraints = intake.constraints?.length
    ? intake.constraints.slice(0, 2).join("; ")
    : "None provided";

  const durationMinutes =
    intake.duration === "Custom"
      ? intake.durationCustomMinutes ?? undefined
      : undefined;

  return `
You are generating a discipleship blueprint for Discipleship by Design. Your audience is volunteer leaders and teachers with little-to-no experience. Your job is to produce a plan that is spiritually faithful, pedagogically sound, realistic to execute, and clearly measurable.

Non-negotiable design principles:
1) Backwards Design (do NOT skip this):
   - Begin with a clear Formation Goal (what learners become/do).
   - Define Measurable Indicators (observable evidence of growth).
   - Write Bloom-aligned learning objectives that ladder toward the formation goal.
   - Only then design session plans, prompts, and practices.

2) Bloom’s Revised Taxonomy:
   - Use Bloom levels: Remember, Understand, Apply, Analyze, Evaluate, Create.
   - Objectives must show intentional progression (not random).
   - Not every level must appear, but there must be clear movement from lower → higher cognition.
   - Each objective must include concrete “Evidence of learning.”

3) Realism & Feasibility:
   - Session plans must fit the given session length.
   - Flow segment minutes MUST sum to the total durationMinutes for the session.
   - Keep plans achievable for volunteers with limited prep.

4) Constraints must shape decisions:
   - Do not merely mention constraints. Adapt activities, pacing, and facilitation to them.
   - The blueprint should “feel” designed around the top 1–2 constraints.

Task-specific requirements:
- Teaching a Class:
  - Prioritize clarity, scripture comprehension, guided discussion, and one concrete practice step.
  - Include recall → discussion → reflection/application rhythm.
- Leading a Workshop:
  - Prioritize participation, exercises, debriefs, and group interaction.
  - Include at least one hands-on activity with a clear debrief.
- Building a Curriculum:
  - Prioritize scope/sequence and progression across sessions.
  - Ensure continuity: each session builds toward cumulative formation outcomes.
  - Include simple leader training / coaching notes and a measurement framework.

Now generate the blueprint using the intake details below:

Task: ${intake.task}
Design Type (use this in header.context.designType): ${designType}
Role (modules must match this role): ${role}
${timeHorizon ? `Time Horizon (use this in header.context.timeHorizon): ${timeHorizon}` : ""}

Audience Age Group: ${intake.ageGroup}
Group Name: ${intake.groupName}
Leader Name: ${intake.leaderName ?? "Not provided"}

Setting: ${intake.setting}${intake.settingDetail ? ` (${intake.settingDetail})` : ""}
Session Length:
${
  intake.duration === "Custom"
    ? `${intake.durationCustomMinutes ?? "?"} minutes`
    : intake.duration
}

Desired Outcome (formation intent): ${intake.desiredOutcome}
Topic/Text: ${intake.topicOrText ?? ""}

Top Constraints (max 2): ${constraints}

Output format rules (STRICT):
- Return ONLY valid JSON (no markdown/backticks/commentary).
- The JSON must match this exact shape and key names:

{
  "header": {
    "title": "string",
    "subtitle": "string (optional)",
    "role": "Teacher | Pastor/Leader | Youth Leader",
    "preparedFor": {
      "leaderName": "string",
      "groupName": "string"
    },
    "context": {
      "designType": "Single Lesson | Multi-Week Series | Quarter Curriculum",
      "timeHorizon": "string",
      "ageGroup": "string",
      "setting": "string",
      "durationMinutes": number,
      "topicOrText": "string",
      "constraints": ["string", "string"]
    }
  },
  "overview": {
    "executiveSummary": "string",
    "outcomes": {
      "formationGoal": "string",
      "measurableIndicators": ["string", "..."]
    },
    "bloomsObjectives": [
      {
        "level": "Remember|Understand|Apply|Analyze|Evaluate|Create",
        "objective": "string",
        "evidence": "string"
      }
    ]
  },
  "modules": {
    "teacher": {
      "prepChecklist": { "beforeTheWeek": ["string"], "dayOf": ["string"] },
      "lessonPlan": {
        "planType": "Single Session|Multi-Session|Quarter/Semester",
        "sessions": [
          {
            "title": "string",
            "durationMinutes": number,
            "flow": [
              { "segment": "string", "minutes": number, "purpose": "string" }
            ]
          }
        ]
      },
      "facilitationPrompts": {
        "openingQuestions": ["string"],
        "discussionQuestions": ["string"],
        "applicationPrompts": ["string"]
      },
      "followUpPlan": { "sameWeekPractice": ["string"], "nextTouchpoint": ["string"] }
    },
    "pastorLeader": "omit unless role is Pastor/Leader",
    "youthLeader": "omit unless role is Youth Leader"
  },
  "recommendedResources": [
    {
      "title": "string",
      "author": "string",
      "publisher": "string",
      "amazonUrl": "string",
      "publisherUrl": "string",
      "whyThisHelps": "string"
    }
  ]
}

Hard rules:
- Root keys must be exactly: header, overview, modules, recommendedResources
- modules.teacher must be an OBJECT (not an array).
- bloomsObjectives must be named exactly "bloomsObjectives" (not learningObjectives).
- Put role/designType/timeHorizon/durationMinutes/constraints into header.context (and leaderName/groupName into header.preparedFor).
- If role is Teacher, include only modules.teacher (do not include pastorLeader/youthLeader).
- Session flow minutes must sum to the session durationMinutes.
`.trim();
}