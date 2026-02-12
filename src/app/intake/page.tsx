"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { ContextOptions } from "@/lib/schema";
import { NeedsOptions } from "@/lib/schema";

type FormData = {
  ageGroup: string;
  problem: string;
  problemDetail?: string;
  outcome: string;
  outcomeDetail?: string;
  context: string;
  contextDetail?: string;
  needs: string[];
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

type StepFourProps = StepBaseProps &
  StepNavProps & {
    toggleNeed: (value: string) => void;
  };

type StepFiveProps = StepBaseProps & {
  back: () => void;
  handleSubmit: () => void;
  loading: boolean;
  error: string | null;
};

export default function IntakePage() {
  const [step, setStep] = useState<number>(1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    ageGroup: "",
    problem: "",
    outcome: "",
    outcomeDetail: "",
    context: "",
    contextDetail: "",
    needs: [],
    leaderName: "",
    groupName: "",
  });

  const next = () => setStep((prev) => Math.min(prev + 1, 5));
  const back = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleNeed = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(value)
        ? prev.needs.filter((n) => n !== value)
        : [...prev.needs, value],
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Map your current form shape -> the API schema shape
      const payload = {
        ageGroup: formData.ageGroup,
        demographic: "Not provided", // You can add a step later; for MVP keep it simple
        ministryProblem:
          formData.problem === "Other" && formData.problemDetail?.trim()
            ? formData.problemDetail.trim()
            : formData.problem,
        desiredOutcome: formData.outcomeDetail?.trim()
          ? `${formData.outcome} — ${formData.outcomeDetail.trim()}`
          : formData.outcome,
        context:
          formData.context === "Other" && formData.contextDetail?.trim()
            ? "Other"
            : (formData.context as
                | "Sunday School"
                | "Bible Study"
                | "Morning Worship"
                | "Small Group"
                | "Other"),
        needs: formData.needs,
        leaderName: formData.leaderName,
        groupName: formData.groupName,
        timeframe: undefined,
      };

      const res = await fetch("/api/generate-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Generate response:", data);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate playbook.");
      }

      router.push(`/result/${data.id}`);
    } catch (err: unknown) {
      console.error("Submit error:", err);
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <p className="text-sm text-white/50 mb-6">Step {step} of 5</p>

        {step === 1 && (
          <StepOne formData={formData} setFormData={setFormData} next={next} />
        )}

        {step === 2 && (
          <StepTwo
            formData={formData}
            setFormData={setFormData}
            next={next}
            back={back}
          />
        )}

        {step === 3 && (
          <StepThree
            formData={formData}
            setFormData={setFormData}
            next={next}
            back={back}
          />
        )}

        {step === 4 && (
          <StepFour
            formData={formData}
            setFormData={setFormData}
            next={next}
            back={back}
            toggleNeed={toggleNeed}
          />
        )}

        {step === 5 && (
          <StepFive
            formData={formData}
            setFormData={setFormData}
            back={back}
            handleSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </main>
  );
}

/* -----------------------------
   Step 1: Age group
------------------------------ */

function StepOne({ formData, setFormData, next }: StepOneProps) {
  const options = [
    "Children",
    "Teens",
    "Young Adults",
    "Adults",
    "Multi-Generational",
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Who are you serving?</h2>

      <div className="grid gap-3">
        {options.map((option) => (
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

      <button
        type="button"
        disabled={!formData.ageGroup}
        onClick={next}
        className="mt-8 bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
      >
        Next
      </button>
    </div>
  );
}

/* -----------------------------
   Step 2: Problem
------------------------------ */

function StepTwo({ formData, setFormData, next, back }: StepTwoProps) {
  const options = [
    "Low engagement",
    "Biblical literacy gaps",
    "Inconsistent attendance",
    "Weak application",
    "Leadership development gaps",
    "Intergenerational disconnect",
    "Other",
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        What problem are you addressing?
      </h2>
      <p className="text-white/60 mb-6">
        Choose the closest match. You can refine it later.
      </p>

      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFormData((p) => ({ ...p, problem: option }))}
            className={`p-4 rounded-lg border text-left transition ${
              formData.problem === option
                ? "border-[#C6A75E] bg-[#C6A75E]/10"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {formData.problem === "Other" && (
        <div className="mt-6">
          <label className="block text-sm text-white/70 mb-2">
            Describe the problem (one sentence)
          </label>
          <input
            value={formData.problemDetail ?? ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, problemDetail: e.target.value }))
            }
            placeholder="Example: Teachers are prepared but members aren’t applying the Word."
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
          disabled={!formData.problem}
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
   Step 3: Outcome
------------------------------ */

function StepThree({ formData, setFormData, next, back }: StepThreeProps) {
  const options = [
    "Increase biblical understanding",
    "Improve application of Scripture",
    "Grow spiritual habits (prayer, Bible reading)",
    "Strengthen participation & consistency",
    "Develop new leaders",
    "Build intergenerational connection",
    "Evangelistic confidence",
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        What outcome do you want to see?
      </h2>
      <p className="text-white/60 mb-6">
        Choose the primary outcome. Add a sentence if you want.
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
          placeholder="Example: Members can explain the passage and apply one concrete practice this week."
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
   Step 4: Context + Needs
------------------------------ */

function StepFour({
  formData,
  setFormData,
  next,
  back,
  toggleNeed,
}: StepFourProps) {
  const contexts = ContextOptions;
  const needs = NeedsOptions;

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
          {contexts.map((c) => (
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
          {needs.map((n) => {
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
          disabled={!formData.context || formData.needs.length === 0}
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
   Step 5: Name + Submit
------------------------------ */

function StepFive({
  formData,
  setFormData,
  back,
  handleSubmit,
  loading,
  error,
}: StepFiveProps) {
  const canGenerate =
    formData.leaderName.trim().length > 0 &&
    formData.groupName.trim().length > 0;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Who is this for?</h2>
      <p className="text-white/60 mb-6">
        Add a name and group title so the output feels personal.
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

      <div className="mt-8 rounded-lg border border-white/15 bg-white/5 p-4">
        <p className="text-sm text-white/70 mb-3">Review</p>
        <ul className="text-sm text-white/80 space-y-1">
          <li>
            <span className="text-white/50">Age Group:</span>{" "}
            {formData.ageGroup}
          </li>
          <li>
            <span className="text-white/50">Problem:</span> {formData.problem}
          </li>
          <li>
            <span className="text-white/50">Outcome:</span> {formData.outcome}
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
        </ul>
      </div>

      <div className="flex justify-between items-center mt-8">
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white transition"
        >
          Back
        </button>

        <button
          type="button"
          disabled={!canGenerate}
          onClick={handleSubmit}
          className="bg-[#C6A75E] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>
    </div>
  );
}
