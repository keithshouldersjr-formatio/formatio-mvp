"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  TrackOptions,
  NeedsOptions,
  AgeGroupOptions,
  ContextOptions,
  GroupTypeOptions,
  TimeHorizonOptions,
  ConstraintOptions,
  type Track,
  type Need,
  type AgeGroup,
  type Context,
  type GroupType,
  type TimeHorizonValue,
  type Constraint,
} from "@/lib/options";

/* -----------------------------
   Types
------------------------------ */

type FormData = {
  track: Track | "";
  groupType: GroupType | "";
  groupTypeDetail?: string;

  ageGroup: AgeGroup | "";

  outcome: string;
  outcomeDetail?: string;

  timeHorizon: TimeHorizonValue | "";

  topicOrText?: string;

  constraints: Constraint[];

  context: Context | "";
  contextDetail?: string;

  needs: Need[];

  leaderName: string;
  groupName: string;
};

type SetFormData = Dispatch<SetStateAction<FormData>>;

type StepBaseProps = {
  formData: FormData;
  setFormData: SetFormData;
};

type StepNavProps = {
  next: () => void;
  back: () => void;
};

type StepOneProps = StepBaseProps & Pick<StepNavProps, "next">;
type StepTwoProps = StepBaseProps & StepNavProps;
type StepThreeProps = StepBaseProps & StepNavProps;
type StepFourProps = StepBaseProps & StepNavProps;
type StepFiveProps = StepBaseProps & StepNavProps;
type StepSixProps = StepBaseProps &
  StepNavProps & {
    toggleNeed: (value: Need) => void;
  };

type StepSevenProps = StepBaseProps & {
  back: () => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  toggleConstraint: (value: Constraint) => void;
};

/* -----------------------------
   Page
------------------------------ */

export default function IntakePage() {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    track: "",
    groupType: "",
    groupTypeDetail: "",

    ageGroup: "",

    outcome: "",
    outcomeDetail: "",

    timeHorizon: "",

    topicOrText: "",

    constraints: [],

    context: "",
    contextDetail: "",

    needs: [],

    leaderName: "",
    groupName: "",
  });

  const next = () => setStep((prev) => Math.min(prev + 1, 7));
  const back = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleNeed = (value: Need) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(value)
        ? prev.needs.filter((n: Need) => n !== value)
        : [...prev.needs, value],
    }));
  };

  const toggleConstraint = (value: Constraint) => {
    setFormData((prev) => ({
      ...prev,
      constraints: prev.constraints.includes(value)
        ? prev.constraints.filter((c: Constraint) => c !== value)
        : [...prev.constraints, value],
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const res = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await res.json()) as { id?: string; error?: string };

      if (!res.ok)
        throw new Error(data.error ?? "Failed to generate blueprint.");
      if (!data.id)
        throw new Error("Blueprint generation did not return an id.");

      window.location.href = `/blueprints/${data.id}`;
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-140px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#C6A75E]/10 blur-3xl" />
        <div className="absolute left-[10%] top-[40%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Thinking overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black">
              <span className="h-7 w-7 rounded-full border-2 border-[#C6A75E]/30 border-t-[#C6A75E] animate-spin" />
            </div>

            <div className="text-lg font-semibold text-[#C6A75E]">
              Generating Your Blueprint
            </div>
            <div className="mt-2 text-sm text-white/60 leading-relaxed">
              Structuring outcomes, Bloom’s objectives, and your session plan…
            </div>

            {submitError ? (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {submitError}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="relative w-full max-w-2xl">
        {/* Brand header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-black">
            <Image
              src="/dd-logo.png"
              alt="Discipleship By Design"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-semibold tracking-tight text-[#C6A75E]">
              Discipleship.Design
            </div>
            <div className="text-sm text-white/60">
              Blueprints for Disciple-Making
            </div>
          </div>
        </div>

        <p className="text-sm text-white/50 mb-4">Step {step} of 7</p>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          {step === 1 && (
            <TrackStep
              formData={formData}
              setFormData={setFormData}
              next={next}
            />
          )}

          {step === 2 && (
            <GroupTypeStep
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
            />
          )}

          {step === 3 && (
            <AgeGroupStep
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
            />
          )}

          {step === 4 && (
            <OutcomeStep
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
            />
          )}

          {step === 5 && (
            <TimeTopicStep
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
            />
          )}

          {step === 6 && (
            <ContextNeedsStep
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
              toggleNeed={toggleNeed}
            />
          )}

          {step === 7 && (
            <FinalizeStep
              formData={formData}
              setFormData={setFormData}
              back={back}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              toggleConstraint={toggleConstraint}
            />
          )}
        </div>
      </div>
    </main>
  );
}

/* -----------------------------
   Step 1: Track
------------------------------ */

function TrackStep({ formData, setFormData, next }: StepOneProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        Who is Formatio helping today?
      </h2>
      <p className="text-white/60 mb-6">
        This shapes the plan structure and recommendations.
      </p>

      <div className="grid gap-3">
        {TrackOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFormData((p) => ({ ...p, track: option }))}
            className={`p-4 rounded-lg border text-left transition ${
              formData.track === option
                ? "border-[#C6A75E] bg-[#C6A75E]/10"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <div className="font-semibold">{option}</div>
            <div className="text-sm text-white/60 mt-1">
              {option === "Teacher" &&
                "Prepare and deliver a strong class session."}
              {option === "Pastor/Leader" &&
                "Build curriculum and training frameworks."}
              {option === "Youth Leader" &&
                "Integrate activities while keeping outcomes clear."}
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!formData.track}
        onClick={next}
        className="mt-8 bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
      >
        Next
      </button>
    </div>
  );
}

/* -----------------------------
   Step 2: Group Type
------------------------------ */

function GroupTypeStep({ formData, setFormData, next, back }: StepTwoProps) {
  const canNext =
    formData.groupType !== "" &&
    (formData.groupType !== "Other" ||
      (formData.groupTypeDetail ?? "").trim().length > 0);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        What group are you leading?
      </h2>
      <p className="text-white/60 mb-6">
        Choose the primary group setting you’re designing for.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {GroupTypeOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFormData((p) => ({ ...p, groupType: option }))}
            className={`p-4 rounded-lg border text-left transition ${
              formData.groupType === option
                ? "border-[#C6A75E] bg-[#C6A75E]/10"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {formData.groupType === "Other" && (
        <div className="mt-5">
          <label className="block text-sm text-white/70 mb-2">
            Describe the group type
          </label>
          <input
            value={formData.groupTypeDetail ?? ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, groupTypeDetail: e.target.value }))
            }
            placeholder="Example: New believer foundations class"
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/60"
          />
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white transition"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Step 3: Age Group
------------------------------ */

function AgeGroupStep({ formData, setFormData, next, back }: StepThreeProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Who are you serving?</h2>
      <p className="text-white/60 mb-6">Choose the primary age group.</p>

      <div className="grid gap-3">
        {AgeGroupOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFormData((p) => ({ ...p, ageGroup: option }))}
            className={`p-4 rounded-lg border text-left transition ${
              formData.ageGroup === option
                ? "border-[#C6A75E] bg-[#C6A75E]/10"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white transition"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!formData.ageGroup}
          onClick={next}
          className="bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Step 4: Outcomes
------------------------------ */

function OutcomeStep({ formData, setFormData, next, back }: StepFourProps) {
  const options = [
    "Increase biblical understanding",
    "Improve application of Scripture",
    "Grow spiritual habits (prayer, Bible reading)",
    "Strengthen participation & consistency",
    "Develop new leaders",
    "Build intergenerational connection",
    "Evangelistic confidence",
  ] as const;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        What outcome do you want to see?
      </h2>
      <p className="text-white/60 mb-6">
        Backwards design starts here: define success first.
      </p>

      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFormData((p) => ({ ...p, outcome: option }))}
            className={`p-4 rounded-lg border text-left transition ${
              formData.outcome === option
                ? "border-[#C6A75E] bg-[#C6A75E]/10"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-sm text-white/70 mb-2">
          Optional: Describe success in one sentence
        </label>
        <textarea
          value={formData.outcomeDetail ?? ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, outcomeDetail: e.target.value }))
          }
          placeholder="Example: Members can explain the passage and apply one practice this week."
          className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/60"
          rows={3}
        />
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white transition"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!formData.outcome}
          onClick={next}
          className="bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Step 5: Time Horizon + Topic/Text
------------------------------ */

function TimeTopicStep({ formData, setFormData, next, back }: StepFiveProps) {
  const canNext = formData.timeHorizon !== "";

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">How big is the plan?</h2>
      <p className="text-white/60 mb-6">
        Choose a time horizon. Add an optional passage/topic for sharper output.
      </p>

      <div className="mb-6">
        <h3 className="text-sm text-white/70 mb-3">Time horizon</h3>
        <div className="grid gap-3">
          {TimeHorizonOptions.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() =>
                setFormData((p) => ({ ...p, timeHorizon: t.value }))
              }
              className={`p-4 rounded-lg border text-left transition ${
                formData.timeHorizon === t.value
                  ? "border-[#C6A75E] bg-[#C6A75E]/10"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        <label className="block text-sm text-white/70 mb-2">
          Optional: Passage / topic / series focus
        </label>
        <input
          value={formData.topicOrText ?? ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, topicOrText: e.target.value }))
          }
          placeholder='Example: Mark 2:13–17 (Dining with sinners) / "Prayer habits"'
          className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/60"
        />
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white transition"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Step 6: Context + Needs
------------------------------ */

function ContextNeedsStep({
  formData,
  setFormData,
  next,
  back,
  toggleNeed,
}: StepSixProps) {
  const canNext = formData.context !== "" && formData.needs.length > 0;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        How will this be delivered?
      </h2>
      <p className="text-white/60 mb-6">
        Choose a context and what you want Formatio to generate.
      </p>

      <div className="mb-8">
        <h3 className="text-sm text-white/70 mb-3">Context</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {ContextOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFormData((p) => ({ ...p, context: c }))}
              className={`p-4 rounded-lg border text-left transition ${
                formData.context === c
                  ? "border-[#C6A75E] bg-[#C6A75E]/10"
                  : "border-white/20 hover:border-white/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {formData.context === "Other" && (
          <div className="mt-4">
            <label className="block text-sm text-white/70 mb-2">
              What is the setting?
            </label>
            <input
              value={formData.contextDetail ?? ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, contextDetail: e.target.value }))
              }
              placeholder="Example: Midweek discipleship group"
              className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/60"
            />
          </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-sm text-white/70 mb-3">What do you need?</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {NeedsOptions.map((n) => {
            const selected = formData.needs.includes(n);
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggleNeed(n)}
                className={`p-4 rounded-lg border text-left transition ${
                  selected
                    ? "border-[#C6A75E] bg-[#C6A75E]/10"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{n}</span>
                  <span
                    className={`text-sm ${
                      selected ? "text-[#C6A75E]" : "text-white/40"
                    }`}
                  >
                    {selected ? "Selected" : "Select"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-white/45 mt-3">
          Tip: choose 1–3 for the cleanest output.
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white transition"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Step 7: Names + Constraints + Submit
------------------------------ */

function FinalizeStep({
  formData,
  setFormData,
  back,
  handleSubmit,
  isSubmitting,
  submitError,
  toggleConstraint,
}: StepSevenProps) {
  const canGenerate =
    formData.leaderName.trim().length > 0 &&
    formData.groupName.trim().length > 0 &&
    formData.track !== "" &&
    formData.groupType !== "" &&
    formData.ageGroup !== "" &&
    formData.outcome.trim().length > 0 &&
    formData.timeHorizon !== "" &&
    formData.context !== "" &&
    formData.needs.length > 0;

  const groupTypeDisplay =
    formData.groupType === "Other" && formData.groupTypeDetail
      ? `${formData.groupType} — ${formData.groupTypeDetail}`
      : formData.groupType;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Finalize</h2>
      <p className="text-white/60 mb-6">
        Add a name + group title and optionally note constraints.
      </p>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">Your name</label>
          <input
            value={formData.leaderName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, leaderName: e.target.value }))
            }
            placeholder="Keith Shoulders"
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/60"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">
            Group or class name
          </label>
          <input
            value={formData.groupName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, groupName: e.target.value }))
            }
            placeholder="Nehemiah’s Table"
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/60"
          />
        </div>
      </div>

      {/* Constraints (optional) */}
      <div className="mt-8">
        <h3 className="text-sm text-white/70 mb-3">Constraints (optional)</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {ConstraintOptions.map((c) => {
            const selected = formData.constraints.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleConstraint(c)}
                className={`p-4 rounded-lg border text-left transition ${
                  selected
                    ? "border-[#C6A75E] bg-[#C6A75E]/10"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{c}</span>
                  <span
                    className={`text-sm ${
                      selected ? "text-[#C6A75E]" : "text-white/40"
                    }`}
                  >
                    {selected ? "Selected" : "Select"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review */}
      <div className="mt-8 rounded-lg border border-white/15 bg-white/5 p-4">
        <p className="text-sm text-white/70 mb-3">Review</p>
        <ul className="text-sm text-white/80 space-y-1">
          <li>
            <span className="text-white/50">Track:</span> {formData.track}
          </li>
          <li>
            <span className="text-white/50">Group type:</span>{" "}
            {groupTypeDisplay}
          </li>
          <li>
            <span className="text-white/50">Age group:</span>{" "}
            {formData.ageGroup}
          </li>
          <li>
            <span className="text-white/50">Outcome:</span> {formData.outcome}
          </li>
          <li>
            <span className="text-white/50">Time horizon:</span>{" "}
            {formData.timeHorizon}
          </li>
          <li>
            <span className="text-white/50">Topic/text:</span>{" "}
            {formData.topicOrText?.trim() ? formData.topicOrText : "—"}
          </li>
          <li>
            <span className="text-white/50">Context:</span> {formData.context}
            {formData.context === "Other" && formData.contextDetail
              ? ` — ${formData.contextDetail}`
              : ""}
          </li>
          <li>
            <span className="text-white/50">Needs:</span>{" "}
            {formData.needs.join(", ")}
          </li>
          <li>
            <span className="text-white/50">Constraints:</span>{" "}
            {formData.constraints.length
              ? formData.constraints.join(", ")
              : "—"}
          </li>
        </ul>
      </div>

      {submitError ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {submitError}
        </div>
      ) : null}

      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={back}
          disabled={isSubmitting}
          className="text-white/60 hover:text-white transition disabled:opacity-40"
        >
          Back
        </button>

        <button
          type="button"
          disabled={!canGenerate || isSubmitting}
          onClick={handleSubmit}
          className="bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          {isSubmitting ? "Generating…" : "Generate Plan"}
        </button>
      </div>
    </div>
  );
}
