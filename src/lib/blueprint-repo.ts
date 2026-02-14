// src/lib/blueprint-repo.ts
import "server-only";
import { supabaseServer } from "@/lib/supabase-server";
import { BlueprintSchema, type Blueprint, type Intake } from "@/lib/schema";
import { supabaseRoute } from "@/lib/supabase-route";

export async function insertBlueprint(
  userId: string,
  intake: Intake,
  blueprint: Blueprint
) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("blueprints")
    .insert({
      user_id: userId,
      intake,
      blueprint,
      title: blueprint.header.title,
      role: blueprint.header.role,
      group_name: blueprint.header.preparedFor.groupName,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

/* export async function fetchBlueprintById(id: string): Promise<Blueprint | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("blueprints")
    .select("blueprint")
    .eq("id", id)
    .single();

  if (error) return null;

  const parsed = BlueprintSchema.safeParse(data?.blueprint);
  if (!parsed.success) {
    console.error("[fetchBlueprintById] schema mismatch", parsed.error.flatten());
    return null;
  }

  return parsed.data;
} */

  export async function fetchBlueprintById(id: string): Promise<Blueprint | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("blueprints")
    .select("id, user_id, title, created_at, blueprint")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[fetchBlueprintById] supabase error", { id, error });
    return null;
  }

  if (!data?.blueprint) {
    console.error("[fetchBlueprintById] no blueprint field", { id, dataKeys: Object.keys(data ?? {}) });
    return null;
  }

  const parsed = BlueprintSchema.safeParse(data.blueprint);

  if (!parsed.success) {
    console.error("[fetchBlueprintById] schema mismatch", {
      id,
      title: data.title,
      created_at: data.created_at,
      issues: parsed.error.flatten(),
      // show top-level keys to quickly diagnose drift
      blueprintKeys:
        typeof data.blueprint === "object" && data.blueprint !== null
          ? Object.keys(data.blueprint as Record<string, unknown>).slice(0, 40)
          : typeof data.blueprint,
    });

    return null;
  }

  return parsed.data;
}

export type BlueprintListItem = {
  id: string;
  title: string;
  role: "Teacher" | "Pastor/Leader" | "Youth Leader";
  groupName: string;
  createdAt: string; // ISO string
}

export async function fetchMyBlueprints(): Promise<BlueprintListItem[]> {
  // 1) Who is the current user? (cookie-based)
  const routeClient = await supabaseRoute();
  const { data: userRes, error: userErr } = await routeClient.auth.getUser();

  if (userErr || !userRes.user) {
    return [];
  }

  // 2) Use service role to query the table (no RLS surprises)
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("blueprints")
    .select("id, title, role, group_name, created_at")
    .eq("user_id", userRes.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? "Untitled Blueprint",
    role: row.role as BlueprintListItem["role"],
    groupName: (row.group_name as string) ?? "",
    createdAt: row.created_at as string,
  }));
}