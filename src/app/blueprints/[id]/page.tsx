// src/app/blueprints/[id]/page.tsx
import Image from "next/image";
import type { Blueprint } from "@/lib/schema";
import { fetchBlueprintById } from "@/lib/blueprint-repo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* -----------------------------
   Small UI helpers
------------------------------ */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h2>
      {subtitle ? <p className="text-sm text-white/60">{subtitle}</p> : null}
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm font-semibold text-white mb-3">{title}</div>
      <ul className="space-y-2 text-sm text-white/75">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#C6A75E]" />
            <span className="leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type FlowItem = { segment: string; minutes: number; purpose: string };

function SessionCard({
  title,
  durationMinutes,
  flow,
}: {
  title: string;
  durationMinutes: number;
  flow: FlowItem[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-[#C6A75E]">{title}</div>
        <div className="text-xs text-white/50">{durationMinutes} min</div>
      </div>

      <div className="mt-4 space-y-3">
        {flow.map((s, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">
                {s.segment}
              </div>
              <div className="text-xs text-white/50">{s.minutes} min</div>
            </div>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              {s.purpose}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -----------------------------
   Not found view
------------------------------ */

function NotFoundView() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-6">
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
          <div className="leading-tight">
            <div className="text-sm text-white/60">Discipleship by Design</div>
            <div className="font-semibold tracking-tight text-[#C6A75E]">
              Blueprint not found
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-white/70 leading-relaxed">
            This blueprint isn’t available. It may have been generated before a
            schema update, or the record is invalid.
          </p>

          <a
            href="/intake"
            className="mt-4 inline-flex rounded-full bg-[#C6A75E] px-5 py-2 text-sm font-semibold text-black"
          >
            Generate a new blueprint
          </a>
        </div>
      </div>
    </main>
  );
}

/* -----------------------------
   Module type guards (fix Vercel TS errors)
------------------------------ */

type TeacherModule = {
  prepChecklist: { beforeTheWeek: string[]; dayOf: string[] };
  lessonPlan: {
    planType: "Single Session" | "Multi-Session" | "Quarter/Semester";
    sessions: { title: string; durationMinutes: number; flow: FlowItem[] }[];
  };
  facilitationPrompts: {
    openingQuestions: string[];
    discussionQuestions: string[];
    applicationPrompts: string[];
  };
  followUpPlan: { sameWeekPractice: string[]; nextTouchpoint: string[] };
};

type PastorLeaderModule = {
  planOverview: {
    planType: "Single Session" | "Multi-Session" | "Quarter/Semester";
    cadence: string;
    alignmentNotes: string[];
  };
  sessions: {
    title: string;
    objective: string;
    leaderPrep: string[];
    takeHomePractice: string[];
    sessionPlan: { title: string; durationMinutes: number; flow: FlowItem[] };
  }[];
  leaderTrainingPlan: {
    trainingSessions: {
      title: string;
      durationMinutes: number;
      agenda: string[];
    }[];
    coachingNotes: string[];
  };
  measurementFramework: {
    inputsToTrack: string[];
    outcomesToMeasure: string[];
    simpleRubric: string[];
  };
};

type YouthLeaderModule = {
  activityIntegratedPlan: {
    sessions: { title: string; durationMinutes: number; flow: FlowItem[] }[];
  };
  activityBank: {
    name: string;
    timeMinutes: number;
    objectiveTie: string;
    setup: string;
    debriefQuestions: string[];
  }[];
  leaderNotes: {
    transitions: string[];
    engagementMoves: string[];
    guardrails: string[];
  };
};

function isTeacherModule(v: unknown): v is TeacherModule {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.prepChecklist === "object" &&
    o.prepChecklist !== null &&
    typeof o.lessonPlan === "object" &&
    o.lessonPlan !== null &&
    typeof o.facilitationPrompts === "object" &&
    o.facilitationPrompts !== null &&
    typeof o.followUpPlan === "object" &&
    o.followUpPlan !== null
  );
}

function isPastorLeaderModule(v: unknown): v is PastorLeaderModule {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.planOverview === "object" &&
    o.planOverview !== null &&
    Array.isArray(o.sessions) &&
    typeof o.leaderTrainingPlan === "object" &&
    o.leaderTrainingPlan !== null &&
    typeof o.measurementFramework === "object" &&
    o.measurementFramework !== null
  );
}

function isYouthLeaderModule(v: unknown): v is YouthLeaderModule {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.activityIntegratedPlan === "object" &&
    o.activityIntegratedPlan !== null &&
    Array.isArray(o.activityBank) &&
    typeof o.leaderNotes === "object" &&
    o.leaderNotes !== null
  );
}

/* -----------------------------
   Module renderers
------------------------------ */

function TeacherModuleView({ bp }: { bp: Blueprint }) {
  const raw = bp.modules.teacher as unknown;
  if (!isTeacherModule(raw)) return null;
  const m = raw;

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Teacher Module"
        subtitle="Prep, facilitation, and follow-up to help you teach with intention."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <ListCard
          title="Prep checklist (before the week)"
          items={m.prepChecklist.beforeTheWeek}
        />
        <ListCard
          title="Prep checklist (day of)"
          items={m.prepChecklist.dayOf}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-white">Lesson plan</div>
          <Pill>{m.lessonPlan.planType}</Pill>
        </div>

        <div className="space-y-4">
          {m.lessonPlan.sessions.map((s, i) => (
            <SessionCard
              key={i}
              title={s.title}
              durationMinutes={s.durationMinutes}
              flow={s.flow}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ListCard
          title="Opening questions"
          items={m.facilitationPrompts.openingQuestions}
        />
        <ListCard
          title="Discussion questions"
          items={m.facilitationPrompts.discussionQuestions}
        />
      </div>

      <ListCard
        title="Application prompts"
        items={m.facilitationPrompts.applicationPrompts}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <ListCard
          title="Same-week practice"
          items={m.followUpPlan.sameWeekPractice}
        />
        <ListCard
          title="Next touchpoint"
          items={m.followUpPlan.nextTouchpoint}
        />
      </div>
    </section>
  );
}

function PastorLeaderModuleView({ bp }: { bp: Blueprint }) {
  const raw = bp.modules.pastorLeader as unknown;
  if (!isPastorLeaderModule(raw)) return null;
  const m = raw;

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Pastor/Leader Module"
        subtitle="Alignment, leader training, and simple measurement to scale disciple-making."
      />

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-white">Plan overview</div>
          <div className="flex gap-2">
            <Pill>{m.planOverview.planType}</Pill>
            <Pill>{m.planOverview.cadence}</Pill>
          </div>
        </div>
        <ListCard
          title="Alignment notes"
          items={m.planOverview.alignmentNotes}
        />
      </div>

      <div className="space-y-4">
        <SectionTitle
          title="Sessions"
          subtitle="Recommended sessions with leader prep and take-home practice."
        />

        <div className="space-y-4">
          {m.sessions.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[#C6A75E]">
                  {i + 1}. {s.title}
                </div>
                <Pill>Objective: {s.objective}</Pill>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ListCard title="Leader prep" items={s.leaderPrep} />
                <ListCard
                  title="Take-home practice"
                  items={s.takeHomePractice}
                />
              </div>

              <SessionCard
                title={s.sessionPlan.title}
                durationMinutes={s.sessionPlan.durationMinutes}
                flow={s.sessionPlan.flow}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <div className="text-sm font-semibold text-white">
            Leader training plan
          </div>

          <div className="space-y-3">
            {m.leaderTrainingPlan.trainingSessions.map((t, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[#C6A75E]">
                    {t.title}
                  </div>
                  <div className="text-xs text-white/50">
                    {t.durationMinutes} min
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  {t.agenda.map((a, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#C6A75E]" />
                      <span className="leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <ListCard
            title="Coaching notes"
            items={m.leaderTrainingPlan.coachingNotes}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <div className="text-sm font-semibold text-white">
            Measurement framework
          </div>
          <ListCard
            title="Inputs to track"
            items={m.measurementFramework.inputsToTrack}
          />
          <ListCard
            title="Outcomes to measure"
            items={m.measurementFramework.outcomesToMeasure}
          />
          <ListCard
            title="Simple rubric"
            items={m.measurementFramework.simpleRubric}
          />
        </div>
      </div>
    </section>
  );
}

function YouthLeaderModuleView({ bp }: { bp: Blueprint }) {
  const raw = bp.modules.youthLeader as unknown;
  if (!isYouthLeaderModule(raw)) return null;
  const m = raw;

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Youth Leader Module"
        subtitle="Activities + debriefs that produce learning evidence."
      />

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="text-sm font-semibold text-white">
          Activity-integrated sessions
        </div>
        <div className="space-y-4">
          {m.activityIntegratedPlan.sessions.map((s, i) => (
            <SessionCard
              key={i}
              title={s.title}
              durationMinutes={s.durationMinutes}
              flow={s.flow}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="text-sm font-semibold text-white">Activity bank</div>
        <div className="space-y-4">
          {m.activityBank.map((a, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-black/30 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[#C6A75E]">
                  {a.name}
                </div>
                <Pill>{a.timeMinutes} min</Pill>
              </div>

              <div className="mt-3 text-sm text-white/70 leading-relaxed">
                <span className="text-white/60">Objective tie: </span>
                {a.objectiveTie}
              </div>

              <div className="mt-3 text-sm text-white/70 leading-relaxed">
                <span className="text-white/60">Setup: </span>
                {a.setup}
              </div>

              <div className="mt-4 text-xs uppercase tracking-wider text-white/50">
                Debrief questions
              </div>
              <ul className="mt-2 space-y-2 text-sm text-white/75">
                {a.debriefQuestions.map((q, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#C6A75E]" />
                    <span className="leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ListCard title="Transitions" items={m.leaderNotes.transitions} />
        <ListCard
          title="Engagement moves"
          items={m.leaderNotes.engagementMoves}
        />
        <ListCard title="Guardrails" items={m.leaderNotes.guardrails} />
      </div>
    </section>
  );
}

/* -----------------------------
   Page
------------------------------ */

export default async function BlueprintPage({
  params,
}: {
  params: { id?: string };
}) {
  const { id } = await params;

  // ✅ Guard against bad routes like /blueprints/undefined
  if (!id || id === "undefined") return <NotFoundView />;

  // ✅ Guard against non-UUIDs (prevents Supabase/Postgres 22P02)
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!UUID_RE.test(id)) return <NotFoundView />;

  // fetch validated blueprint; repo returns Blueprint | null
  const blueprint = await fetchBlueprintById(id);
  if (!blueprint) return <NotFoundView />;

  const role = blueprint.header?.role;
  if (!role) return <NotFoundView />;

  const constraints = blueprint.header.context.constraints?.length
    ? blueprint.header.context.constraints.join(" · ")
    : null;

  const topic = blueprint.header.context.topicOrText?.trim()
    ? blueprint.header.context.topicOrText
    : null;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* subtle premium background */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#C6A75E]/10 blur-3xl" />
        <div className="absolute left-[10%] top-[35%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-10">
        {/* Top bar */}
        <div className="sticky top-0 z-10 -mx-6 mb-8 border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur">
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
              <div className="leading-tight">
                <div className="text-sm text-white/60">
                  Discipleship by Design
                </div>
                <div className="font-semibold tracking-tight text-white">
                  {blueprint.header.preparedFor.groupName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/intake"
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.07] transition"
              >
                New blueprint
              </a>

              {/* Must match your route file: /api/blueprints/[id]/pdf */}
              <a
                href={`/api/blueprint/${id}/pdf`}
                className="rounded-full bg-[#C6A75E] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>

        {/* Hero */}
        <header className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>Role: {role}</Pill>
            <Pill>Leader: {blueprint.header.preparedFor.leaderName}</Pill>
            <Pill>Group: {blueprint.header.preparedFor.groupName}</Pill>
            <Pill>Age: {blueprint.header.context.ageGroup}</Pill>
            <Pill>Setting: {blueprint.header.context.setting}</Pill>
            <Pill>Horizon: {blueprint.header.context.timeHorizon}</Pill>
            <Pill>Design: {blueprint.header.context.designType}</Pill>
            <Pill>{blueprint.header.context.durationMinutes} min</Pill>
            {topic ? <Pill>Topic/Text: {topic}</Pill> : null}
            {constraints ? <Pill>Constraints: {constraints}</Pill> : null}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#C6A75E]">
            {blueprint.header.title}
          </h1>

          {blueprint.header.subtitle ? (
            <p className="text-base text-white/70">
              {blueprint.header.subtitle}
            </p>
          ) : null}

          <p className="max-w-3xl text-white/70 leading-relaxed">
            {blueprint.overview.executiveSummary}
          </p>
        </header>

        {/* Formation outcome */}
        <section className="space-y-4">
          <SectionTitle
            title="Formation Outcome"
            subtitle="This is the north star for the blueprint (Backwards Design)."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-white mb-2">
                Formation goal
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                {blueprint.overview.outcomes.formationGoal}
              </p>
            </div>

            <ListCard
              title="Measurable indicators"
              items={blueprint.overview.outcomes.measurableIndicators}
            />
          </div>
        </section>

        {/* Bloom objectives */}
        <section className="mt-10 space-y-4">
          <SectionTitle
            title="Bloom’s Objectives"
            subtitle="A progression of learning outcomes (head → heart → hands)."
          />

          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            {blueprint.overview.bloomsObjectives.map((o, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[#C6A75E]">
                    {o.level}
                  </div>
                  <div className="text-xs text-white/50">Objective {i + 1}</div>
                </div>

                <div className="mt-2 text-sm text-white/85 leading-relaxed">
                  {o.objective}
                </div>

                <div className="mt-3 text-xs uppercase tracking-wider text-white/50">
                  Evidence of learning
                </div>
                <div className="mt-1 text-sm text-white/70 leading-relaxed">
                  {o.evidence}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modules */}
        <div className="mt-10 space-y-10">
          {role === "Teacher" ? <TeacherModuleView bp={blueprint} /> : null}
          {role === "Pastor/Leader" ? (
            <PastorLeaderModuleView bp={blueprint} />
          ) : null}
          {role === "Youth Leader" ? (
            <YouthLeaderModuleView bp={blueprint} />
          ) : null}
        </div>

        {/* Resources */}
        <section className="mt-12 space-y-4">
          <SectionTitle
            title="Recommended Resources"
            subtitle="A short stack to deepen your practice and sharpen your blueprint."
          />

          <div className="grid gap-4">
            {blueprint.recommendedResources.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#C6A75E]">
                      {r.title}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {r.author} · {r.publisher}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={r.amazonUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.07] transition"
                    >
                      Amazon
                    </a>
                    <a
                      href={r.publisherUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.07] transition"
                    >
                      Publisher
                    </a>
                  </div>
                </div>

                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  {r.whyThisHelps}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-10 pb-6 text-center text-xs text-white/40">
          Generated by Discipleship by Design · Teach With Intention
        </footer>
      </div>
    </main>
  );
}
