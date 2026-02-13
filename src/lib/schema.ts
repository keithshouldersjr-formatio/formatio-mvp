// src/lib/schema.ts
import { z } from "zod";

/* ----------------------------------
   OPTION CONSTANTS
----------------------------------- */

export const RoleOptions = ["Teacher", "Pastor/Leader", "Youth Leader"] as const;
export type Role = (typeof RoleOptions)[number];

export const DesignTypeOptions = [
  "Single Lesson",
  "Multi-Week Series",
  "Quarter Curriculum",
] as const;
export type DesignType = (typeof DesignTypeOptions)[number];

export const TimeHorizonOptions = [
  "Single Session",
  "4–6 Weeks",
  "Quarter/Semester",
] as const;
export type TimeHorizon = (typeof TimeHorizonOptions)[number];

export const AgeGroupOptions = [
  "Children",
  "Students",
  "Adults",
  "Multi-Generational",
] as const;
export type AgeGroup = (typeof AgeGroupOptions)[number];

export const SettingOptions = [
  "Sunday School",
  "Small Group",
  "Youth Gathering",
  "Leadership Training",
  "Midweek Bible Study",
  "Other",
] as const;
export type Setting = (typeof SettingOptions)[number];

export const DurationOptions = ["45–60 min", "75–90 min", "Custom"] as const;
export type Duration = (typeof DurationOptions)[number];

/* ----------------------------------
   INTAKE SCHEMA (MVP SAFE)
   - Keep this aligned with Intake page payload
----------------------------------- */

export const IntakeSchema = z
  .object({
    role: z.enum(RoleOptions),
    designType: z.enum(DesignTypeOptions),
    timeHorizon: z.enum(TimeHorizonOptions),
    ageGroup: z.enum(AgeGroupOptions),

    setting: z.enum(SettingOptions),
    settingDetail: z.string().optional(),

    duration: z.enum(DurationOptions),
    durationCustomMinutes: z.number().int().min(10).max(240).optional(),

    // IMPORTANT: if your UI may omit it, keep optional.
    // If you want it required, change to z.string().min(1)
    topicOrText: z.string().optional(),

    desiredOutcome: z.string().min(5),

    leaderName: z.string().min(1).optional(),
    groupName: z.string().min(1),

    // Prefer array at API boundary; your Intake page can split text into array.
    constraints: z.array(z.string()).optional(),
  })
  .superRefine((v, ctx) => {
    // If setting is "Other", require settingDetail
    if (v.setting === "Other" && !v.settingDetail?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["settingDetail"],
        message: "settingDetail is required when setting is Other.",
      });
    }

    // If duration is "Custom", require durationCustomMinutes
    if (v.duration === "Custom") {
      if (typeof v.durationCustomMinutes !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["durationCustomMinutes"],
          message: "durationCustomMinutes is required when duration is Custom.",
        });
      }
    }
  });

export type Intake = z.infer<typeof IntakeSchema>;

/* ----------------------------------
   BLUEPRINT OUTPUT SCHEMA
   - Strongly type Teacher module to fix TS build errors
----------------------------------- */

const BloomLevelSchema = z.enum([
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
]);

const FlowItemSchema = z.object({
  segment: z.string(),
  minutes: z.number().int().min(1).max(240),
  purpose: z.string(),
});

const SessionSchema = z.object({
  title: z.string(),
  durationMinutes: z.number().int().min(10).max(240),
  flow: z.array(FlowItemSchema).min(1),
});

// Keep this aligned with what your prompt produces for teacher module
const TeacherModuleSchema = z.object({
  prepChecklist: z.object({
    beforeTheWeek: z.array(z.string()).min(1),
    dayOf: z.array(z.string()).min(1),
  }),

  lessonPlan: z.object({
    planType: z.enum(["Single Session", "Multi-Session", "Quarter/Semester"]),
    sessions: z.array(SessionSchema).min(1),
  }),

  facilitationPrompts: z.object({
    openingQuestions: z.array(z.string()).min(1),
    discussionQuestions: z.array(z.string()).min(1),
    applicationPrompts: z.array(z.string()).min(1),
  }),

  followUpPlan: z.object({
    sameWeekPractice: z.array(z.string()).min(1),
    nextTouchpoint: z.array(z.string()).min(1),
  }),
});

export const BlueprintSchema = z.object({
  header: z.object({
    title: z.string(),
    subtitle: z.string().optional(),

    role: z.enum(RoleOptions),

    preparedFor: z.object({
      leaderName: z.string(),
      groupName: z.string(),
    }),

    // NOTE: keep these typed loosely enough to tolerate "Other" handling,
    // but still structured enough for UI.
    context: z.object({
      setting: z.enum(SettingOptions).or(z.string()),
      ageGroup: z.enum(AgeGroupOptions).or(z.string()),

      designType: z.enum(DesignTypeOptions).or(z.string()),
      timeHorizon: z.enum(TimeHorizonOptions).or(z.string()),

      durationMinutes: z.number().int().min(10).max(240),

      // In your prompt you often send "" or actual string
      topicOrText: z.string(),

      constraints: z.array(z.string()).optional(),
    }),
  }),

  overview: z.object({
    executiveSummary: z.string(),

    outcomes: z.object({
      formationGoal: z.string(),
      measurableIndicators: z.array(z.string()).min(3),
    }),

    bloomsObjectives: z
      .array(
        z.object({
          level: BloomLevelSchema,
          objective: z.string(),
          evidence: z.string(),
        })
      )
      .length(6),
  }),

  modules: z.object({
    // ✅ strongly typed (fixes your Vercel TS error)
    teacher: TeacherModuleSchema.optional(),

    // Leave these permissive until you’re rendering them safely everywhere.
    pastorLeader: z.unknown().optional(),
    youthLeader: z.unknown().optional(),
  }),

  recommendedResources: z
    .array(
      z.object({
        title: z.string(),
        author: z.string(),
        publisher: z.string(),
        amazonUrl: z.string(),
        publisherUrl: z.string(),
        whyThisHelps: z.string(),
      })
    )
    .min(3),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;