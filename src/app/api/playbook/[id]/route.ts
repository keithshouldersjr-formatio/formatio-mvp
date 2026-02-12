import { NextResponse } from "next/server";
import { getPlaybook } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // unwrap params

  const playbook = getPlaybook(id);

  if (!playbook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ playbook });
}