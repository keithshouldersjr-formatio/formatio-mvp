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

/* ----------------------------------
   INTAKE (unchanged)
----------------------------------- */

export const IntakeSchema = z
  .object({
    //task: TaskSchema,

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

    // Derived fields (optional)
    role: RoleSchema.optional(),
    designType: DesignTypeSchema.optional(),
    timeHorizon: TimeHorizonSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.duration === "Custom" && typeof val.durationCustomMinutes !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["durationCustomMinutes"],
        message: "Custom duration requires durationCustomMinutes.",
      });
    }

    // Only curriculum requires time horizon
    /* if (val.task === "Build Curriculum" && !val.timeHorizon) {
      ctx.addIssue({
        code: "custom",
        path: ["timeHorizon"],
        message: "Time horizon is required when Build Curriculum.",
      });
    } */
  });

export type Intake = z.infer<typeof IntakeSchema>;

/* ----------------------------------
   DBD METHOD TYPES (single model)
----------------------------------- */

const DbdMovementSchema = z.enum(["Inform", "Inspire", "Involve"]);
export type DbdMovement = z.infer<typeof DbdMovementSchema>;

const HeadHeartHandsSchema = z.object({
  head: z.string().min(3),
  heart: z.string().min(3),
  hands: z.string().min(3),
});

const EngagementSchema = z.object({
  inform: z.array(z.string().min(2)).min(1),
  inspire: z.array(z.string().min(2)).min(1),
  involve: z.array(z.string().min(2)).min(1),
});

/* ----------------------------------
   SESSION / FLOW (DBD-native)
----------------------------------- */

const FlowItemSchema = z.object({
  segment: z.string().min(2),
  minutes: z.number().int().min(1).max(240),

  // plain language for volunteers
  purpose: z.string().min(3),

  // REQUIRED: explicitly tagged as Inform/Inspire/Involve
  movement: DbdMovementSchema,
});

const SessionSchema = z.object({
  title: z.string().min(1),
  durationMinutes: z.number().int().min(10).max(240),

  // REQUIRED for every session
  objectives: HeadHeartHandsSchema,
  engagement: EngagementSchema,

  // Still available for detailed plans + PDF rendering
  flow: z.array(FlowItemSchema).min(1),
});


/* ----------------------------------
   MODULES (DBD-native)
   - TIGHTENED for single-session teacher shape
----------------------------------- */

const SingleSessionLessonPlanSchema = z.object({
  planType: z.literal("Single Session"),
  sessions: z.array(SessionSchema).length(1),
});

const TeacherModuleSchema = z.object({
  // ✅ single checklist list (no beforeTheWeek/dayOf split)
  prepChecklist: z.array(z.string().min(2)).min(1).max(12),

  // ✅ enforce single session
  lessonPlan: SingleSessionLessonPlanSchema,
});

const PastorLeaderModuleSchema = z.object({
  planOverview: z.object({
    planType: z.enum(["Single Session", "Multi-Session", "Quarter/Semester"]),
    cadence: z.string().min(2),
    alignmentNotes: z.array(z.string().min(2)).min(1),
  }),

  sessions: z
    .array(
      z.object({
        title: z.string().min(1),
        objective: z.string().min(3),
        leaderPrep: z.array(z.string().min(2)).min(1),
        takeHomePractice: z.array(z.string().min(2)).min(1),

        // Use the same DBD-native session model for consistency
        sessionPlan: SessionSchema,
      }),
    )
    .min(1),

  leaderTrainingPlan: z.object({
    trainingSessions: z
      .array(
        z.object({
          title: z.string().min(1),
          durationMinutes: z.number().int().min(10).max(240),
          agenda: z.array(z.string().min(2)).min(1),
        }),
      )
      .min(1),
    coachingNotes: z.array(z.string().min(2)).min(1),
  }),

  measurementFramework: z.object({
    inputsToTrack: z.array(z.string().min(2)).min(1),
    outcomesToMeasure: z.array(z.string().min(2)).min(1),
    simpleRubric: z.array(z.string().min(2)).min(1),
  }),
});

const YouthLeaderModuleSchema = z.object({
  activityIntegratedPlan: z.object({
    sessions: z.array(SessionSchema).min(1),
  }),

  activityBank: z
    .array(
      z.object({
        name: z.string().min(1),
        timeMinutes: z.number().int().min(5).max(240),
        objectiveTie: z.string().min(3),
        setup: z.string().min(3),
        debriefQuestions: z.array(z.string().min(2)).min(1),
      }),
    )
    .min(1),

  leaderNotes: z.object({
    transitions: z.array(z.string().min(2)).min(1),
    engagementMoves: z.array(z.string().min(2)).min(1),
    guardrails: z.array(z.string().min(2)).min(1),
  }),
});

/* ----------------------------------
   BLUEPRINT OUTPUT (DBD-native)
   - UPDATED for new overview + teacher module shape
----------------------------------- */

export const BlueprintSchema = z.object({
  header: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),

    role: z.enum(RoleOptions),

    preparedFor: z.object({
      leaderName: z.string().min(1),
      groupName: z.string().min(1),
    }),

    context: z.object({
      setting: z.enum(SettingOptions).or(z.string()),
      ageGroup: z.enum(AgeGroupOptions).or(z.string()),

      designType: z.literal("Single Lesson"),
      timeHorizon: z.literal("Single Session"),

      durationMinutes: z.number().int().min(10).max(240),
      topicOrText: z.string(),
      constraints: z.array(z.string()).optional(),
    }),
  }),

  overview: z.object({
    // ✅ executiveSummary removed (formationGoal becomes the top-level explanation on UI)
    outcomes: z.object({
      formationGoal: z.string().min(10),

      // ✅ measurableIndicators renamed
      howToMeasureGrowth: z.array(z.string().min(3)).min(3),
    }),

    headHeartHandsObjectives: HeadHeartHandsSchema,
  }),

  modules: z.object({
  teacher: TeacherModuleSchema, // ✅ required
}),

  recommendedResources: z
    .array(
      z.object({
        title: z.string().min(1),
        author: z.string().min(1),
        publisher: z.string().min(1),
        amazonUrl: z.string().min(1),
        publisherUrl: z.string().min(1),
        whyThisHelps: z.string().min(10),
      }),
    )
    .min(3),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;