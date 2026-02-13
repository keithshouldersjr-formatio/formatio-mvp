import { notFound } from "next/navigation";
import type { Blueprint } from "@/lib/schema";
import { fetchBlueprintById } from "@/lib/blueprint-repo";

// keep your UI helpers + module renderers exactly the same,
// just swap "playbook" variable name to "blueprint"

export const dynamic = "force-dynamic";

export default async function BlueprintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const blueprint = (await fetchBlueprintById(id)) as Blueprint | null;
  if (!blueprint) return notFound();

  // render using blueprint.header / blueprint.overview / blueprint.modules...
  // (copy your existing results component body and rename variables)

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ...your existing elite UI... */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-[#e1b369]">
          {blueprint.header.title}
        </h1>
        {/* render the rest */}
      </div>
    </main>
  );
}
