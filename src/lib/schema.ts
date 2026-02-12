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
  ageGroup: z.string().min(1),
  demographic: z.string().min(1),
  ministryProblem: z.string().min(10),
  desiredOutcome: z.string().min(10),
  context: z.enum(ContextOptions),
  needs: z.array(z.enum(NeedsOptions)).min(1),
  leaderName: z.string().min(1),
  groupName: z.string().min(1),
  timeframe: z.string().optional(), // e.g. "single session", "6 weeks"
});

export type Intake = z.infer<typeof IntakeSchema>;

export const PlaybookSchema = z.object({
  title: z.string().min(5),
  subtitle: z.string().optional(),

  preparedFor: z.object({
    leaderName: z.string().min(1),
    groupName: z.string().min(1),
    context: z.string().min(1),
    audience: z.string().min(1),
  }),

  executiveSummary: z.string().min(20),

  formationProblem: z.object({
    statement: z.string().min(10),
    likelyCauses: z.array(z.string().min(5)).min(1),
    constraints: z.array(z.string().min(3)).optional(),
  }),

  outcomes: z.object({
    formationGoal: z.string().min(10),
    measurableIndicators: z.array(z.string().min(5)).min(1),
  }),

  bloomsObjectives: z
    .array(
      z.object({
        level: z.enum([
          "Remember",
          "Understand",
          "Apply",
          "Analyze",
          "Evaluate",
          "Create",
        ]),
        objective: z.string().min(10),
        evidence: z.string().min(5),
      })
    )
    .min(1),

  strategy: z.object({
    principles: z.array(z.string().min(5)).min(1),
    methods: z.array(
      z.object({
        name: z.string().min(3),
        whenToUse: z.string().min(5),
        howToRun: z.string().min(10),
        commonMistakes: z.array(z.string().min(3)).optional(),
      })
    ).min(1),
  }),

  implementation: z.object({
    planType: z.enum([
      "Single Session",
      "Multi-Session",
      "Quarter/Semester",
    ]),

    sessions: z.array(
      z.object({
        title: z.string().min(3),
        durationMinutes: z.number().int().min(5).max(300),

        flow: z.array(
          z.object({
            segment: z.string().min(3),
            minutes: z.number().int().min(1).max(180),
            purpose: z.string().min(5),
          })
        ).min(1),
      })
    ).min(1),
  }),

  leaderCoachingNotes: z.array(z.string().min(5)).min(1),

  assessment: z.object({
    before: z.array(z.string().min(3)).min(1),
    during: z.array(z.string().min(3)).min(1),
    after: z.array(z.string().min(3)).min(1),
  }),

  recommendedResources: z
    .array(
      z.object({
        title: z.string().min(2),
        author: z.string().min(2),
        publisher: z.string().min(2),

        // Relaxed URL validation — critical for MVP
        amazonUrl: z.string().min(5),
        publisherUrl: z.string().min(5),

        whyThisHelps: z.string().min(10),
      })
    )
    .min(1)
    .max(10),
});

export type Playbook = z.infer<typeof PlaybookSchema>;