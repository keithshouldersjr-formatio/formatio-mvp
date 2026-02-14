// src/lib/intake.ts
import type { Task } from "@/lib/schema";
import type { Role, DesignType, TimeHorizon } from "@/lib/options";

export function deriveRoleFromTask(task: Task): Role {
  switch (task) {
    case "Teaching A Class":
      return "Teacher";
    case "Leading A Workshop":
      return "Pastor/Leader";
    case "Building A Curriculum":
      return "Pastor/Leader";
  }
}

export function deriveDesignTypeFromTask(task: Task): DesignType {
  switch (task) {
    case "Teaching A Class":
      return "Single Lesson";
    case "Leading A Workshop":
      return "Single Lesson";
    case "Building A Curriculum":
      return "Quarter Curriculum";
  }
}

export function requiresTimeHorizon(task: Task): boolean {
  return task === "Building A Curriculum";
}

export function defaultTimeHorizon(task: Task): TimeHorizon {
  // used for class/workshop (curriculum must be chosen by user)
  return "Single Session";
}