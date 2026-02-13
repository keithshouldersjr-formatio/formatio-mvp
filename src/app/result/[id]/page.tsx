import Image from "next/image";
import type { Playbook } from "@/lib/schema";
import { fetchPlaybookById } from "@/lib/playbook-repo";

export const dynamic = "force-dynamic";

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

function SessionCard({
  title,
  durationMinutes,
  flow,
}: {
  title: string;
  durationMinutes: number;
  flow: { segment: string; minutes: number; purpose: string }[];
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
   Track module renderers
------------------------------ */

function TeacherModuleView({ pb }: { pb: Playbook }) {
  const m = pb.modules.teacher;
  if (!m) return null;

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Teacher Module"
        subtitle="Practical prep + facilitation prompts for a strong class session."
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

function PastorLeaderModuleView({ pb }: { pb: Playbook }) {
  const m = pb.modules.pastorLeader;
  if (!m) return null;

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Pastor/Leader Module"
        subtitle="A scalable framework for alignment, training, and measurement."
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

function YouthLeaderModuleView({ pb }: { pb: Playbook }) {
  const m = pb.modules.youthLeader;
  if (!m) return null;

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
   Not found (use this instead of throwing)
------------------------------ */

function NotFoundView() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black">
            <Image
              src="/dd-logo.png"
              alt="Discipleship Design"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm text-white/60">Discipleship Design</div>
            <div className="font-semibold tracking-tight text-[#C6A75E]">
              Playbook not found
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-white/70 leading-relaxed">
            This playbook isn’t available anymore. It may have been generated
            before a recent update, or the record may be invalid.
          </p>

          <a
            href="/intake"
            className="mt-4 inline-flex rounded-full bg-[#C6A75E] px-5 py-2 text-sm font-semibold text-black"
          >
            Generate a new playbook
          </a>

          <p className="mt-4 text-xs text-white/40">
            Tip: after schema updates, older playbooks may not render.
          </p>
        </div>
      </div>
    </main>
  );
}

/* -----------------------------
   Page
------------------------------ */

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ DO NOT cast. fetchPlaybookById now returns validated Playbook | null.
  const playbook = await fetchPlaybookById(id);
  if (!playbook) return <NotFoundView />;

  // ✅ Extra guard (should never trigger if repo validation is correct)
  if (!playbook.header || !playbook.header.track) return <NotFoundView />;

  const track = playbook.header.track;
  const constraints = playbook.header.context.constraints?.length
    ? playbook.header.context.constraints.join(" · ")
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
                  alt="Discipleship Design"
                  fill
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm text-white/60">Formatio Playbook</div>
                <div className="font-semibold tracking-tight text-white">
                  {playbook.header.preparedFor.groupName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/intake"
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.07] transition"
              >
                New playbook
              </a>

              <a
                href={`/api/playbook/${id}/pdf`}
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
            <Pill>Track: {track}</Pill>
            <Pill>Prepared for: {playbook.header.preparedFor.leaderName}</Pill>
            <Pill>Group: {playbook.header.audience.groupType}</Pill>
            <Pill>Age: {playbook.header.audience.ageGroup}</Pill>
            <Pill>Context: {playbook.header.context.setting}</Pill>
            <Pill>Horizon: {playbook.header.context.timeHorizon}</Pill>
            {playbook.header.context.topicOrText ? (
              <Pill>Topic: {playbook.header.context.topicOrText}</Pill>
            ) : null}
            {constraints ? <Pill>Constraints: {constraints}</Pill> : null}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#C6A75E]">
            {playbook.header.title}
          </h1>

          {playbook.header.subtitle ? (
            <p className="text-base text-white/70">
              {playbook.header.subtitle}
            </p>
          ) : null}

          <p className="max-w-3xl text-white/70 leading-relaxed">
            {playbook.overview.executiveSummary}
          </p>
        </header>

        {/* Outcomes */}
        <section className="space-y-4">
          <SectionTitle
            title="Formation Outcome"
            subtitle="This is the north star for the entire plan (Backwards Design)."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-white mb-2">
                Formation goal
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                {playbook.overview.outcomes.formationGoal}
              </p>
            </div>

            <ListCard
              title="Measurable indicators"
              items={playbook.overview.outcomes.measurableIndicators}
            />
          </div>
        </section>

        {/* Formation problem */}
        <section className="mt-10 space-y-4">
          <SectionTitle
            title="Formation Problem (Inferred)"
            subtitle="What is currently missing that the desired outcome aims to produce."
          />

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
            <div>
              <div className="text-sm font-semibold text-white mb-2">
                Statement
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                {playbook.overview.formationProblem.statement}
              </p>
            </div>

            <ListCard
              title="Likely causes"
              items={playbook.overview.formationProblem.likelyCauses}
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
            {playbook.overview.bloomsObjectives.map((o, i) => (
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

        {/* Track module */}
        <div className="mt-10 space-y-10">
          {track === "Teacher" ? <TeacherModuleView pb={playbook} /> : null}
          {track === "Pastor/Leader" ? (
            <PastorLeaderModuleView pb={playbook} />
          ) : null}
          {track === "Youth Leader" ? (
            <YouthLeaderModuleView pb={playbook} />
          ) : null}
        </div>

        {/* Resources */}
        <section className="mt-12 space-y-4">
          <SectionTitle
            title="Recommended Resources"
            subtitle="A short stack to deepen your practice and sharpen your plan."
          />

          <div className="grid gap-4">
            {playbook.recommendedResources.map((r, i) => (
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
          Generated by Formatio · Intelligent congregational formation
        </footer>
      </div>
    </main>
  );
}
