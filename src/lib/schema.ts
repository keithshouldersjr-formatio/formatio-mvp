import { z } from "zod";

export const ContextOptions = [
  "Sunday School",
  "Bible Study",
  "Morning Worship",
  "Small Group",
  "Leadership Training",
  "Other",
] as const;

export const NeedsOptions = [
  "Curriculum",
  "Teaching Plan",
  "Teaching Methods",
  "Leader Training",
  "Itinerary",
] as const;

export const IntakeSchema = z.object({
  ageGroup: z.string().min(2),
  demographic: z.string().min(2),
  ministryProblem: z.string().min(10),
  desiredOutcome: z.string().min(10),
  context: z.enum(ContextOptions),
  needs: z.array(z.enum(NeedsOptions)).min(1),
  leaderName: z.string().min(2),
  groupName: z.string().min(2),
  timeframe: z.string().optional(), // e.g. "single session", "6 weeks"
});

export type Intake = z.infer<typeof IntakeSchema>;

export const PlaybookSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  preparedFor: z.object({
    leaderName: z.string(),
    groupName: z.string(),
    context: z.string(),
    audience: z.string(),
  }),
  executiveSummary: z.string(),

  formationProblem: z.object({
    statement: z.string(),
    likelyCauses: z.array(z.string()).min(2),
    constraints: z.array(z.string()).optional(),
  }),

  outcomes: z.object({
    formationGoal: z.string(),
    measurableIndicators: z.array(z.string()).min(3),
  }),

  bloomsObjectives: z.array(
    z.object({
      level: z.enum(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]),
      objective: z.string(),
      evidence: z.string(),
    })
  ).min(4),

  strategy: z.object({
    principles: z.array(z.string()).min(3),
    methods: z.array(
      z.object({
        name: z.string(),
        whenToUse: z.string(),
        howToRun: z.string(),
        commonMistakes: z.array(z.string()).optional(),
      })
    ).min(3),
  }),

  implementation: z.object({
    planType: z.enum(["Single Session", "Multi-Session", "Quarter/Semester"]),
    sessions: z.array(
      z.object({
        title: z.string(),
        durationMinutes: z.number().int().min(10).max(240),
        flow: z.array(
          z.object({
            segment: z.string(),
            minutes: z.number().int().min(1).max(120),
            purpose: z.string(),
          })
        ).min(3),
      })
    ).min(1),
  }),

  leaderCoachingNotes: z.array(z.string()).min(3),

  assessment: z.object({
    before: z.array(z.string()).min(1),
    during: z.array(z.string()).min(2),
    after: z.array(z.string()).min(2),
  }),

  recommendedResources: z.array(
    z.object({
      title: z.string(),
      author: z.string(),
      publisher: z.string(),
      amazonUrl: z.string().url(),
      publisherUrl: z.string().url(),
      whyThisHelps: z.string(),
    })
  ).min(3).max(8),
});

export type Playbook = z.infer<typeof PlaybookSchema>;