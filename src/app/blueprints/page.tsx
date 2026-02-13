import Link from "next/link";
import Image from "next/image";
import { fetchMyBlueprints } from "@/lib/blueprint-repo";
import { AppTopBar } from "@/components/AppTopBar";

export const dynamic = "force-dynamic";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

export default async function BlueprintsPage() {
  const items = await fetchMyBlueprints();

  return (
    <main className="min-h-screen bg-black text-white">
      <AppTopBar />

      <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black">
              <Image
                src="/dd-logo.png"
                alt="Discipleship by Design"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <div className="text-sm text-white/60">
                Discipleship by Design
              </div>
              <div className="text-lg font-semibold text-[#e1b369]">
                My Blueprints
              </div>
            </div>
          </div>

          <Link
            href="/intake"
            className="rounded-full bg-[#e1b369] px-5 py-2 text-sm font-semibold text-black"
          >
            New Blueprint
          </Link>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/70">
            You haven’t generated any blueprints yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((bp) => (
              <div
                key={bp.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-base font-semibold text-[#e1b369]">
                      {bp.title}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill>{bp.track}</Pill>
                      <Pill>{bp.groupName}</Pill>
                      <Pill>{new Date(bp.createdAt).toLocaleDateString()}</Pill>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/blueprints/${bp.id}`}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.07] transition"
                    >
                      View
                    </Link>

                    <a
                      href={`/api/blueprints/${bp.id}/pdf`}
                      className="rounded-full bg-[#e1b369] px-4 py-2 text-sm font-semibold text-black"
                    >
                      PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
