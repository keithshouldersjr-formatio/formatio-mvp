// src/lib/prompt.ts
import type { Intake } from "./schema";

/* -----------------------------
   Formatting helpers
------------------------------ */

function formatContext(intake: Intake) {
  const detail =
    intake.context === "Other" && intake.contextDetail
      ? ` — ${intake.contextDetail}`
      : "";
  return `${intake.context}${detail}`;
}

function formatGroupType(intake: Intake) {
  const detail =
    intake.groupType === "Other" && intake.groupTypeDetail
      ? ` — ${intake.groupTypeDetail}`
      : "";
  return `${intake.groupType}${detail}`;
}

function formatOutcome(intake: Intake) {
  const detail = intake.outcomeDetail ? ` — ${intake.outcomeDetail}` : "";
  return `${intake.outcome}${detail}`;
}

function formatTopic(intake: Intake) {
  const t = (intake.topicOrText ?? "").trim();
  return t.length ? t : "Not provided";
}

function formatConstraints(intake: Intake) {
  const items = intake.constraints?.length ? intake.constraints.join(", ") : "";
  return items.trim().length ? items : "None provided";
}

/* -----------------------------
   Time horizon label helper
   (ID → display label)
------------------------------ */

function timeHorizonLabel(v: Intake["timeHorizon"]) {
  if (v === "single") return "Single Session";
  if (v === "weeks_4_6") return "4–6 Weeks";
  return "Quarter/Semester";
}

/* -----------------------------
   Track guidance
------------------------------ */

function trackGuidance(track: Intake["track"]) {
  if (track === "Teacher") {
    return `
- Focus on volunteer-friendly clarity: prep checklist + session flow + facilitation prompts.
- Provide discussion questions and application prompts that are concrete and Scripture-shaped.
- Keep it practical (assume limited prep time).
`.trim();
  }

  if (track === "Pastor/Leader") {
    return `
- Focus on alignment across preaching, teaching, and small groups around shared formation outcomes.
- Include leader training and a simple measurement framework.
- Prefer scalable structures and coaching notes for ministry teams.
`.trim();
  }

  return `
- Integrate activities AND connect them explicitly to Bloom objectives.
- Keep segments short, interactive, and transition-friendly.
- Include debrief questions that turn activities into learning evidence.
`.trim();
}

function moduleRule(track: Intake["track"]) {
  if (track === "Teacher") return 'Include ONLY "modules.teacher" (omit the others).';
  if (track === "Pastor/Leader")
    return 'Include ONLY "modules.pastorLeader" (omit the others).';
  return 'Include ONLY "modules.youthLeader" (omit the others).';
}

/* -----------------------------
   Prompt builder
------------------------------ */

export function buildPlaybookPrompt(intake: Intake) {
  const groupType = formatGroupType(intake);
  const context = formatContext(intake);
  const outcome = formatOutcome(intake);
  const topic = formatTopic(intake);
  const constraints = formatConstraints(intake);
  const needs = intake.needs.join(", ");
  const timeLabel = timeHorizonLabel(intake.timeHorizon);

  return `
You are an expert Christian educator and ministry formation strategist.
Create a "Playbook" using Backwards Design (desired outcomes → evidence/assessment → learning plan),
Bloom's Taxonomy, and proven teaching/learning practices suitable for Christian education settings.

Write with pastoral warmth and educational rigor. Be concrete and actionable. No fluff.
Assume the user is a busy volunteer or ministry leader who needs clarity fast. Assume that the user
has not studied education and is unaware of theory.
The user's main priority is to ensure that the content being taught leads to transformation. The playbook
should be something that the average volunteer with a high school education can implement in a christian
education content to help shape and grow christian disciples.

INPUTS
Track: ${intake.track}
Group type: ${groupType}
Audience (age group): ${intake.ageGroup}
Time horizon: ${timeLabel}
Topic / passage / series focus: ${topic}
Context (delivery setting): ${context}
Desired outcome (primary): ${outcome}
Needs selected: ${needs}
Constraints: ${constraints}
Prepared for: ${intake.leaderName} (${intake.groupName})

TRACK-SPECIFIC PRIORITIES
${trackGuidance(intake.track)}

OUTPUT REQUIREMENTS
- Return ONLY valid JSON. No markdown. No commentary.
- JSON MUST match this structure EXACTLY:

{
  "header": {
    "title": string,
    "subtitle"?: string,
    "track": "Teacher" | "Pastor/Leader" | "Youth Leader",
    "preparedFor": { "leaderName": string, "groupName": string },
    "audience": { "groupType": string, "ageGroup": string },
    "context": {
      "setting": string,
      "timeHorizon": "Single Session" | "4–6 Weeks" | "Quarter/Semester",
      "topicOrText"?: string,
      "constraints"?: string[]
    }
  },
  "overview": {
    "executiveSummary": string,
    "formationProblem": { "statement": string, "likelyCauses": string[] },
    "outcomes": { "formationGoal": string, "measurableIndicators": string[] },
    "bloomsObjectives": [
      { "level": "Remember"|"Understand"|"Apply"|"Analyze"|"Evaluate"|"Create", "objective": string, "evidence": string }
    ]
  },
  "modules": {
    "teacher"?: { ... },
    "pastorLeader"?: { ... },
    "youthLeader"?: { ... }
  },
  "recommendedResources": [
    { "title": string, "author": string, "publisher": string, "amazonUrl": string, "publisherUrl": string, "whyThisHelps": string }
  ]
}

EXECUTIVE SUMMARY RULES
- Reference the Track and Time horizon explicitly.
- Restate the desired outcome in plain language.
- Explain how the plan produces that outcome.
- Keep it concise (max 300 words).

FORMATION PROBLEM (INFERRED)
- Infer formationProblem.statement based on the desired outcome + audience + context.
- likelyCauses should be plausible in church education settings.
- Use constraints if provided.

BLOOM'S TAXONOMY RULES
- overview.bloomsObjectives MUST include EXACTLY 6 items, in this exact order:
  Remember, Understand, Apply, Analyze, Evaluate, Create.
- Each objective must be specific and measurable.
- Each evidence field must say what you would look for to know the learner achieved it.

MEASUREMENT RULES
- overview.outcomes.measurableIndicators must include at least 3 items (5 is better).
- Indicators must be observable and realistic for the context.

MODULE COMPLETENESS RULES (CRITICAL)
- Do NOT output empty objects anywhere (e.g. "pastorLeader": {} is forbidden).
- If a module key exists, it MUST include every required field for that module.
- For the selected track, you MUST fully populate the module object.
- Omit non-selected modules entirely (do not include them as null or {}).

MODULE RULES FOR THIS REQUEST
- Track is: ${intake.track}
- ${moduleRule(intake.track)}
- Keep module content aligned to the selected needs: ${needs}

MODULE SCHEMAS (MUST MATCH EXACTLY)

A) modules.teacher (required when track is "Teacher")
{
  "prepChecklist": { "beforeTheWeek": string[], "dayOf": string[] },
  "lessonPlan": {
    "planType": "Single Session"|"Multi-Session",
    "sessions": [
      { "title": string, "durationMinutes": number, "flow": [ { "segment": string, "minutes": number, "purpose": string } ] }
    ]
  },
  "facilitationPrompts": { "openingQuestions": string[], "discussionQuestions": string[], "applicationPrompts": string[] },
  "followUpPlan": { "sameWeekPractice": string[], "nextTouchpoint": string[] }
}
Teacher COUNT RULES
- prepChecklist.beforeTheWeek: at least 3
- prepChecklist.dayOf: at least 3
- facilitationPrompts.openingQuestions: at least 3
- facilitationPrompts.discussionQuestions: at least 4
- facilitationPrompts.applicationPrompts: at least 3
- followUpPlan.sameWeekPractice: at least 2
- followUpPlan.nextTouchpoint: at least 2
- Each lessonPlan session.flow: 4–7 segments, each segment minutes >= 3

B) modules.pastorLeader (required when track is "Pastor/Leader")
{
  "planOverview": {
    "planType": "Multi-Session" | "Quarter/Semester",
    "cadence": string,
    "alignmentNotes": string[]
  },
  "sessions": [
    {
      "title": string,
      "objective": string,
      "leaderPrep": string[],
      "sessionPlan": {
        "title": string,
        "durationMinutes": number,
        "flow": [ { "segment": string, "minutes": number, "purpose": string } ]
      },
      "takeHomePractice": string[]
    }
  ],
  "leaderTrainingPlan": {
    "trainingSessions": [
      { "title": string, "durationMinutes": number, "agenda": string[] }
    ],
    "coachingNotes": string[]
  },
  "measurementFramework": {
    "inputsToTrack": string[],
    "outcomesToMeasure": string[],
    "simpleRubric": string[]
  }
}
Pastor/Leader COUNT RULES
- planOverview.alignmentNotes: at least 3
- sessions: at least 4
- each session.leaderPrep: at least 2
- each session.takeHomePractice: at least 2
- each sessionPlan.flow: 4–7 segments; each segment minutes >= 3
- leaderTrainingPlan.trainingSessions: at least 1
- each trainingSessions.agenda: at least 4
- leaderTrainingPlan.coachingNotes: at least 4
- measurementFramework.inputsToTrack: at least 3
- measurementFramework.outcomesToMeasure: at least 3
- measurementFramework.simpleRubric: at least 3

C) modules.youthLeader (required when track is "Youth Leader")
{
  "activityIntegratedPlan": {
    "sessions": [
      { "title": string, "durationMinutes": number, "flow": [ { "segment": string, "minutes": number, "purpose": string } ] }
    ]
  },
  "activityBank": [
    { "name": string, "objectiveTie": string, "setup": string, "timeMinutes": number, "debriefQuestions": string[] }
  ],
  "leaderNotes": { "transitions": string[], "engagementMoves": string[], "guardrails": string[] }
}
Youth COUNT RULES
- activityIntegratedPlan.sessions: at least 1
- activityBank: at least 3
- each activity.debriefQuestions: at least 3
- leaderNotes.transitions: at least 3
- leaderNotes.engagementMoves: at least 3
- leaderNotes.guardrails: at least 3
- Each session.flow: 4–7 segments; each segment minutes >= 3

RECOMMENDED RESOURCES RULES
- recommendedResources must include 3–6 items.
- Keep them credible and widely available.
- Use real URLs only when confident; otherwise use SEARCH URLs:
  Amazon search: https://www.amazon.com/s?k=<urlencoded title + author>
  Publisher search: https://www.google.com/search?q=<urlencoded publisher + title>
- Do NOT invent ISBNs.
- Do NOT fabricate endorsements or quotes.

FINAL VALIDATION CHECK (DO THIS BEFORE RETURNING JSON)
- Ensure header.track matches the selected track string exactly.
- Ensure ONLY the correct module exists.
- Ensure the correct module is fully populated and meets all minimum counts.
- Return pure JSON only. No markdown. No extra keys. No trailing commas.
`.trim();
}