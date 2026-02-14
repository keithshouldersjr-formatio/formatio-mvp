"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

import {
  RoleOptions,
  DesignTypeOptions,
  TimeHorizonOptions,
  AgeGroupOptions,
  SettingOptions,
  DurationOptions,
  type Role,
  type DesignType,
  type TimeHorizon,
  type AgeGroup,
  type Setting,
  type Duration,
} from "@/lib/options";

type FormData = {
  designType: DesignType | "";
  timeHorizon: TimeHorizon | "";

  role: Role | "";
  ageGroup: AgeGroup | "";

  groupName: string;

  desiredOutcome: string;
  topicOrText: string;

  setting: Setting | "";
  settingDetail: string;

  duration: Duration | "";
  durationCustomMinutes: string; // keep as string in UI; convert on submit

  constraints: string; // textarea → we normalize to string[] on submit

  leaderName: string; // optional
};

type SetFormData = Dispatch<SetStateAction<FormData>>;

function PremiumThinkingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      {/* ambient glow */}
      <div className="absolute h-[500px] w-[500px] rounded-full bg-[#C6A75E]/10 blur-3xl animate-pulse" />

      <div className="relative flex flex-col items-center gap-8">
        {/* Spinner core */}
        <div className="relative h-24 w-24">
          {/* outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C6A75E] animate-spin" />

          {/* inner glow ring */}
          <div className="absolute inset-2 rounded-full border border-[#C6A75E]/40 animate-pulse" />

          {/* center orb */}
          <div className="absolute inset-6 rounded-full bg-[#C6A75E]/20 backdrop-blur-sm" />
        </div>

        {/* Text block */}
        <div className="text-center space-y-3">
          <div className="text-lg font-semibold tracking-wide text-[#C6A75E]">
            Designing Your Blueprint
          </div>

          <div className="text-sm text-white/60 max-w-xs leading-relaxed">
            Structuring outcomes. Aligning formation goals.
            <br />
            Building your intentional plan…
          </div>

          {/* subtle animated dots */}
          <div className="flex justify-center gap-1 mt-2">
            <span className="h-2 w-2 rounded-full bg-[#C6A75E] animate-bounce [animation-delay:-0.2s]" />
            <span className="h-2 w-2 rounded-full bg-[#C6A75E] animate-bounce [animation-delay:-0.1s]" />
            <span className="h-2 w-2 rounded-full bg-[#C6A75E] animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "p-4 rounded-2xl border text-left transition",
        selected
          ? "border-[#e1b369] bg-[#e1b369]/10"
          : "border-white/15 hover:border-white/35 bg-white/[0.02]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function splitConstraints(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function IntakePage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    designType: "",
    timeHorizon: "",

    role: "",
    ageGroup: "",

    groupName: "",

    desiredOutcome: "",
    topicOrText: "",

    setting: "",
    settingDetail: "",

    duration: "",
    durationCustomMinutes: "",

    constraints: "",

    leaderName: "",
  });

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // ----------------------------
  // Step validation
  // ----------------------------
  const canGoStep1 = formData.designType !== "" && formData.timeHorizon !== "";

  const canGoStep2 =
    formData.role !== "" &&
    formData.ageGroup !== "" &&
    formData.groupName.trim().length > 0;

  const canGoStep3 = formData.desiredOutcome.trim().length >= 10;

  const durationNeedsCustom =
    formData.duration === "Custom" &&
    formData.durationCustomMinutes.trim().length > 0;

  const canSubmit = useMemo(() => {
    const settingOk =
      formData.setting !== "" &&
      (formData.setting !== "Other" ||
        formData.settingDetail.trim().length > 0);

    const durationOk =
      formData.duration !== "" &&
      (formData.duration !== "Custom" || durationNeedsCustom);

    return canGoStep1 && canGoStep2 && canGoStep3 && settingOk && durationOk;
  }, [
    canGoStep1,
    canGoStep2,
    canGoStep3,
    formData.setting,
    formData.settingDetail,
    formData.duration,
    durationNeedsCustom,
  ]);

  // ----------------------------
  // Submit
  // ----------------------------
  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Convert durationCustomMinutes to number (only when duration=Custom)
      const durationCustomMinutes =
        formData.duration === "Custom"
          ? Number(formData.durationCustomMinutes)
          : undefined;

      // Normalize constraints textarea → string[]
      //const constraintsArray = splitConstraints(formData.constraints);

      const constraintsArray =
        formData.constraints.trim().length > 0
          ? formData.constraints
              .split(/\n|,/g)
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
          : [];

      const payload = {
        designType: formData.designType,
        timeHorizon: formData.timeHorizon,
        role: formData.role,
        ageGroup: formData.ageGroup,
        groupName: formData.groupName.trim(),
        leaderName: formData.leaderName.trim() || undefined,
        desiredOutcome: formData.desiredOutcome.trim(),
        topicOrText: formData.topicOrText.trim() || "",
        setting: formData.setting,
        settingDetail:
          formData.setting === "Other"
            ? formData.settingDetail.trim()
            : undefined,
        duration: formData.duration,
        durationCustomMinutes,
        constraints: constraintsArray.length > 0 ? constraintsArray : undefined,
      };

      const res = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Include issues if your API returns them
      const data = (await res.json()) as {
        id?: string;
        error?: string;
        issues?: unknown;
      };

      if (!res.ok) {
        const details = data.issues
          ? `\n\nDetails: ${JSON.stringify(data.issues)}`
          : "";
        throw new Error(
          (data.error ?? "Failed to generate blueprint.") + details,
        );
      }

      if (!data.id)
        throw new Error("Blueprint generation did not return an id.");

      router.push(`/blueprints/${data.id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <PremiumThinkingOverlay visible={isSubmitting} />
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-140px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#e1b369]/10 blur-3xl" />
        <div className="absolute left-[10%] top-[40%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Brand header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-black">
            <Image
              src="/dd-logo.png"
              alt="Discipleship by Design"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-semibold tracking-tight text-[#e1b369]">
              Discipleship by Design
            </div>
            <div className="text-sm text-white/60">Teach With Intention.</div>
          </div>
        </div>

        <p className="text-sm text-white/50 mb-4">Step {step} of 4</p>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {step === 1 ? (
            <StepOne
              formData={formData}
              setFormData={setFormData}
              next={next}
              canNext={canGoStep1}
            />
          ) : null}

          {step === 2 ? (
            <StepTwo
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
              canNext={canGoStep2}
            />
          ) : null}

          {step === 3 ? (
            <StepThree
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
              canNext={canGoStep3}
            />
          ) : null}

          {step === 4 ? (
            <StepFour
              formData={formData}
              setFormData={setFormData}
              back={back}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onSubmit={handleSubmit}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

/* -----------------------------
   Step 1: Design type + horizon
------------------------------ */
function StepOne({
  formData,
  setFormData,
  next,
  canNext,
}: {
  formData: FormData;
  setFormData: SetFormData;
  next: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">What are you preparing?</h2>
        <p className="text-white/60">
          Choose what you’re designing. We’ll build the blueprint around your
          outcome.
        </p>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-white/70">Design type</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {DesignTypeOptions.map((d) => (
            <CardButton
              key={d}
              selected={formData.designType === d}
              onClick={() => setFormData((p) => ({ ...p, designType: d }))}
            >
              <div className="font-semibold">{d}</div>
            </CardButton>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-white/70">Time horizon</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {TimeHorizonOptions.map((t) => (
            <CardButton
              key={t}
              selected={formData.timeHorizon === t}
              onClick={() => setFormData((p) => ({ ...p, timeHorizon: t }))}
            >
              <div className="font-semibold">{t}</div>
            </CardButton>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canNext}
        onClick={next}
        className="bg-[#e1b369] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
      >
        Next
      </button>
    </div>
  );
}

/* -----------------------------
   Step 2: Role + audience
------------------------------ */
function StepTwo({
  formData,
  setFormData,
  next,
  back,
  canNext,
}: {
  formData: FormData;
  setFormData: SetFormData;
  next: () => void;
  back: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Who are you leading?</h2>
        <p className="text-white/60">
          This helps tailor tone, pacing, and methods.
        </p>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-white/70">Your role</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {RoleOptions.map((r) => (
            <CardButton
              key={r}
              selected={formData.role === r}
              onClick={() => setFormData((p) => ({ ...p, role: r }))}
            >
              <div className="font-semibold">{r}</div>
            </CardButton>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-white/70">Age group</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {AgeGroupOptions.map((a) => (
            <CardButton
              key={a}
              selected={formData.ageGroup === a}
              onClick={() => setFormData((p) => ({ ...p, ageGroup: a }))}
            >
              <div className="font-semibold">{a}</div>
            </CardButton>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">Group name</label>
          <input
            value={formData.groupName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, groupName: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="e.g., Nehemiah’s Table"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">
            Your name (optional for now)
          </label>
          <input
            value={formData.leaderName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, leaderName: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="e.g., Keith"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="bg-[#e1b369] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Step 3: Desired outcome + topic/text
------------------------------ */
function StepThree({
  formData,
  setFormData,
  next,
  back,
  canNext,
}: {
  formData: FormData;
  setFormData: SetFormData;
  next: () => void;
  back: () => void;
  canNext: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Desired formation outcome
        </h2>
        <p className="text-white/60">
          What should learners understand, believe, or practice because of this?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">
            Outcome (write 1–3 sentences)
          </label>
          <textarea
            value={formData.desiredOutcome}
            onChange={(e) =>
              setFormData((p) => ({ ...p, desiredOutcome: e.target.value }))
            }
            rows={5}
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="Example: Learners can explain the passage’s main claim and practice one concrete act of obedience this week."
          />
          <p className="mt-2 text-xs text-white/45">
            Tip: Write it as observable change, not a vague desire.
          </p>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">
            Scripture or topic (optional)
          </label>
          <input
            value={formData.topicOrText}
            onChange={(e) =>
              setFormData((p) => ({ ...p, topicOrText: e.target.value }))
            }
            className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
            placeholder="Example: Mark 2:13–17 or Prayer"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="bg-[#e1b369] text-black px-6 py-2 rounded-full font-semibold disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -----------------------------
   Step 4: Context + constraints + submit
------------------------------ */
function StepFour({
  formData,
  setFormData,
  back,
  canSubmit,
  isSubmitting,
  submitError,
  onSubmit,
}: {
  formData: FormData;
  setFormData: SetFormData;
  back: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Context & constraints</h2>
        <p className="text-white/60">
          This helps shape pacing, structure, and engagement choices.
        </p>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-white/70">Setting</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SettingOptions.map((s) => (
            <CardButton
              key={s}
              selected={formData.setting === s}
              onClick={() => setFormData((p) => ({ ...p, setting: s }))}
            >
              <div className="font-semibold">{s}</div>
            </CardButton>
          ))}
        </div>

        {formData.setting === "Other" ? (
          <div>
            <label className="block text-sm text-white/70 mb-2">
              Describe the setting
            </label>
            <input
              value={formData.settingDetail}
              onChange={(e) =>
                setFormData((p) => ({ ...p, settingDetail: e.target.value }))
              }
              className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
              placeholder="Example: Sunday evening discipleship circle"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="text-sm text-white/70">Typical session length</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {DurationOptions.map((d) => (
            <CardButton
              key={d}
              selected={formData.duration === d}
              onClick={() => setFormData((p) => ({ ...p, duration: d }))}
            >
              <div className="font-semibold">{d}</div>
            </CardButton>
          ))}
        </div>

        {formData.duration === "Custom" ? (
          <div>
            <label className="block text-sm text-white/70 mb-2">
              Custom minutes
            </label>
            <input
              value={formData.durationCustomMinutes}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  durationCustomMinutes: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
              placeholder="e.g., 50"
              inputMode="numeric"
            />
          </div>
        ) : null}
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-2">
          Constraints (optional)
        </label>
        <textarea
          value={formData.constraints}
          onChange={(e) =>
            setFormData((p) => ({ ...p, constraints: e.target.value }))
          }
          rows={3}
          className="w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
          placeholder="One per line (recommended): e.g., limited prep time; mixed Bible knowledge; high energy group; no projector..."
        />
        <p className="mt-2 text-xs text-white/45">
          Tip: Put one constraint per line for best results.
        </p>
      </div>

      {submitError ? (
        <p className="text-sm text-red-400 whitespace-pre-wrap">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={back}
          className="text-white/60 hover:text-white"
        >
          Back
        </button>

        <button
          type="button"
          disabled={!canSubmit || isSubmitting}
          onClick={onSubmit}
          className="rounded-full bg-[#e1b369] px-6 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          Generate Blueprint
        </button>
      </div>
    </div>
  );
}
