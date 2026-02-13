import "server-only";
import { supabaseServer } from "@/lib/supabase-server";
import type { Intake, Blueprint } from "@/lib/schema";

export type BlueprintRow = {
  id: string;
  created_at: string;
  blueprint: Blueprint;
};

export type BlueprintListItem = {
  id: string;
  createdAt: string;
  title: string;
  track: string;
  groupName: string;
};

export async function insertBlueprint(intake: Intake, blueprint: Blueprint) {
  const supabase = supabaseServer();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("blueprints")
    .insert({
      user_id: user.id,
      intake,
      blueprint,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function fetchBlueprintById(id: string): Promise<Blueprint | null> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("blueprints")
    .select("blueprint")
    .eq("id", id)
    .single<{ blueprint: Blueprint }>();

  if (error) return null;
  return data.blueprint ?? null;
}

export async function fetchMyBlueprints(): Promise<BlueprintListItem[]> {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("blueprints")
    .select("id, created_at, blueprint")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<BlueprintRow[]>();

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    title: row.blueprint.header?.title ?? "Untitled Blueprint",
    track: row.blueprint.header?.track ?? "—",
    groupName: row.blueprint.header?.preparedFor?.groupName ?? "—",
  }));
}