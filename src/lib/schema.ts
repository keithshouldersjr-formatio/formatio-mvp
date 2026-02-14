// src/lib/schema.ts
import { z } from "zod";
import {
  RoleOptions,
  DesignTypeOptions,
  TimeHorizonOptions,
  AgeGroupOptions,
  SettingOptions,
  DurationOptions,
  ConstraintOptions,
  TaskOptions,
} from "@/lib/options";

/* ----------------------------------
   OPTION CONSTANTS
----------------------------------- */

export const TaskSchema = z.enum(TaskOptions);
export type Task = z.infer<typeof TaskSchema>;

const RoleSchema = z.enum(RoleOptions);
const DesignTypeSchema = z.enum(DesignTypeOptions);
const TimeHorizonSchema = z.enum(TimeHorizonOptions);
const AgeGroupSchema = z.enum(AgeGroupOptions);
const SettingSchema = z.enum(SettingOptions);
const DurationSchema = z.enum(DurationOptions);
const ConstraintSchema = z.enum(ConstraintOptions);

export const IntakeSchema = z
  .object({
    // NEW: task is the primary selector
    task: TaskSchema,

    // Audience/context
    ageGroup: AgeGroupSchema,
    groupName: z.string().min(1),
    leaderName: z.string().optional(),

    desiredOutcome: z.string().min(10),
    topicOrText: z.string().optional(),

    setting: SettingSchema,
    settingDetail: z.string().optional(),

    duration: DurationSchema,
    durationCustomMinutes: z.number().optional(),

    constraints: z.array(ConstraintSchema).max(2).optional(),

    // Derived fields (optional, but present if you want to store them)
    // These are set by prompt generation logic, not by UI.
    role: RoleSchema.optional(),
    designType: DesignTypeSchema.optional(),
    timeHorizon: TimeHorizonSchema.optional(),
  })
  .superRefine((val, ctx) => {
    // Duration custom requires minutes
    if (val.duration === "Custom" && typeof val.durationCustomMinutes !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["durationCustomMinutes"],
        message: "Custom duration requires durationCustomMinutes.",
      });
    }

    // Only curriculum requires time horizon
    if (val.task === "Building A Curriculum" && !val.timeHorizon) {
      ctx.addIssue({
        code: "custom",
        path: ["timeHorizon"],
        message: "Time horizon is required when building a curriculum.",
      });
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

// --- Add below TeacherModuleSchema (or near it) ---

const PastorLeaderModuleSchema = z.object({
  planOverview: z.object({
    planType: z.enum(["Single Session", "Multi-Session", "Quarter/Semester"]),
    cadence: z.string(), // e.g., "Weekly", "Biweekly", etc.
    alignmentNotes: z.array(z.string()).min(1),
  }),

  sessions: z
    .array(
      z.object({
        title: z.string(),
        objective: z.string(),
        leaderPrep: z.array(z.string()).min(1),
        takeHomePractice: z.array(z.string()).min(1),
        sessionPlan: SessionSchema,
      })
    )
    .min(1),

  leaderTrainingPlan: z.object({
    trainingSessions: z
      .array(
        z.object({
          title: z.string(),
          durationMinutes: z.number().int().min(10).max(240),
          agenda: z.array(z.string()).min(1),
        })
      )
      .min(1),
    coachingNotes: z.array(z.string()).min(1),
  }),

  measurementFramework: z.object({
    inputsToTrack: z.array(z.string()).min(1),
    outcomesToMeasure: z.array(z.string()).min(1),
    simpleRubric: z.array(z.string()).min(1),
  }),
});

const YouthLeaderModuleSchema = z.object({
  activityIntegratedPlan: z.object({
    sessions: z.array(SessionSchema).min(1),
  }),

  activityBank: z
    .array(
      z.object({
        name: z.string(),
        timeMinutes: z.number().int().min(5).max(240),
        objectiveTie: z.string(),
        setup: z.string(),
        debriefQuestions: z.array(z.string()).min(1),
      })
    )
    .min(1),

  leaderNotes: z.object({
    transitions: z.array(z.string()).min(1),
    engagementMoves: z.array(z.string()).min(1),
    guardrails: z.array(z.string()).min(1),
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
  teacher: TeacherModuleSchema.optional(),
  pastorLeader: PastorLeaderModuleSchema.optional(),
  youthLeader: YouthLeaderModuleSchema.optional(),
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