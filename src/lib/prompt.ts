import type { Intake } from "./schema";

export function buildPlaybookPrompt(intake: Intake) {
  const needs = intake.needs.join(", ");

  return `
You are an expert Christian educator and ministry formation strategist.
Create a "Playbook" that helps a ministry leader solve an educational formation problem using Bloom's Taxonomy and proven teaching/learning practices.
Write with pastoral warmth and educational rigor. Be concrete and actionable. No fluff.

INPUTS
Audience (age group): ${intake.ageGroup}
Demographic notes: ${intake.demographic}
Ministry problem to solve: ${intake.ministryProblem}
Desired outcome: ${intake.desiredOutcome}
Setting/context: ${intake.context}
Needs requested: ${needs}
Timeframe: ${intake.timeframe ?? "Not specified"}
Leader name: ${intake.leaderName}
Group/class name: ${intake.groupName}

OUTPUT REQUIREMENTS
- Return ONLY valid JSON.
- JSON must match this structure:
{
  "title": string,
  "subtitle": string?,
  "preparedFor": { "leaderName": string, "groupName": string, "context": string, "audience": string },
  "executiveSummary": string,
  "formationProblem": { "statement": string, "likelyCauses": string[], "constraints": string[]? },
  "outcomes": { "formationGoal": string, "measurableIndicators": string[] },
  "bloomsObjectives": [{ "level": "Remember"|"Understand"|"Apply"|"Analyze"|"Evaluate"|"Create", "objective": string, "evidence": string }],
  "strategy": {
    "principles": string[],
    "methods": [{ "name": string, "whenToUse": string, "howToRun": string, "commonMistakes": string[]? }]
  },
  "implementation": {
    "planType": "Single Session"|"Multi-Session"|"Quarter/Semester",
    "sessions": [{ "title": string, "durationMinutes": number, "flow": [{ "segment": string, "minutes": number, "purpose": string }] }]
  },
  "leaderCoachingNotes": string[],
  "assessment": { "before": string[], "during": string[], "after": string[] },
  "recommendedResources": [{ "title": string, "author": string, "publisher": string, "amazonUrl": string, "publisherUrl": string, "whyThisHelps": string }]
}

LINK RULES (VERY IMPORTANT)
- Use real URLs when confident.
- If not confident, use SEARCH URLs:
  Amazon search: https://www.amazon.com/s?k=<urlencoded title + author>
  Publisher search: use the publisher site search page if known; otherwise use https://www.google.com/search?q=<urlencoded publisher + title>
- Do NOT invent ISBNs.
`;
}