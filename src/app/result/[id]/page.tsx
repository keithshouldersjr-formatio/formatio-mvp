import { notFound } from "next/navigation";
import type { Playbook } from "@/lib/schema";

type PlaybookApiResponse = { playbook: Playbook };

async function getPlaybook(id: string): Promise<PlaybookApiResponse | null> {
  const res = await fetch(`http://localhost:3000/api/playbook/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as PlaybookApiResponse;
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ unwrap params

  const data = await getPlaybook(id);
  if (!data) return notFound();

  const { playbook } = data;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-semibold text-[#C6A75E]">
          {playbook.title}
        </h1>

        <p className="text-white/70">{playbook.executiveSummary}</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Bloom’s Objectives</h2>
          <ul className="space-y-2">
            {playbook.bloomsObjectives.map((obj, i) => (
              <li
                key={i}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="font-semibold text-[#C6A75E]">{obj.level}</div>
                <div>{obj.objective}</div>
                <div className="text-white/70">{obj.evidence}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
