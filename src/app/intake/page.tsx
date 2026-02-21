"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

import {
  ConstraintOptions,
  AgeGroupOptions,
  SettingOptions,
  DurationOptions,
  type Constraint,
  type AgeGroup,
  type Setting,
  type Duration,
} from "@/lib/options";

type FormData = {
  // Step 1
  desiredOutcome: string;
  topicOrText: string;

  // Step 2
  ageGroup: AgeGroup | "";
  groupName: string;
  leaderName: string;

  // Step 3
  setting: Setting | "";
  settingDetail: string;

  duration: Duration | "";
  durationCustomMinutes: string;

  constraintsSelected: Constraint[];
};

type SetFormData = Dispatch<SetStateAction<FormData>>;

function CardButton({
  selected,
  onClick,
  children,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "p-4 rounded-2xl border text-left transition",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        selected
          ? "border-[#e1b369] bg-[#e1b369]/10"
          : "border-white/15 hover:border-white/35 bg-white/[0.02]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function PremiumThinkingOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative h-full w-full flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <Image
                src="/dd-logo.png"
                alt="Discipleship by Design"
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <div className="flex-1">
              <div className="text-sm text-white/60">
                Discipleship by Design
              </div>
              <div className="text-lg font-semibold tracking-tight text-[#e1b369]">
                Designing your blueprint…
              </div>
            </div>

            <div className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-[#e1b369] animate-spin" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 bg-[#e1b369]/70 animate-pulse rounded-full" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              We’re building your plan with clear outcomes, pacing, prompts, and
              practical activities. This usually takes a few seconds.
            </p>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wider text-white/40">
                What’s happening
              </div>
              <ul className="mt-2 text-sm text-white/70 space-y-1">
                <li>• Interpreting your goal and audience</li>
                <li>• Structuring the session flow</li>
                <li>• Generating Inform / Inspire / Involve prompts</li>
              </ul>
            </div>
          </div>

          <p className="mt-4 text-xs text-white/40">
            Tip: keep this tab open until the blueprint loads.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function IntakePage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    desiredOutcome: "",
    topicOrText: "",

    ageGroup: "",
    groupName: "",
    leaderName: "",

    setting: "",
    settingDetail: "",

    duration: "",
    durationCustomMinutes: "",

    constraintsSelected: [],
  });

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // Step gates
  const canGoStep1 = formData.desiredOutcome.trim().length >= 10;
  const canGoStep2 =
    formData.ageGroup !== "" && formData.groupName.trim().length > 0;

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

    return canGoStep1 && canGoStep2 && settingOk && durationOk;
  }, [
    canGoStep1,
    canGoStep2,
    formData.setting,
    formData.settingDetail,
    formData.duration,
    durationNeedsCustom,
  ]);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const durationCustomMinutes =
        formData.duration === "Custom"
          ? Number(formData.durationCustomMinutes)
          : undefined;

      const payload = {
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

        constraints: formData.constraintsSelected.length
          ? formData.constraintsSelected
          : undefined,

        // Optional: you can set role here explicitly if you want,
        // but your API already defaults role to Teacher.
        // role: "Teacher",
      };

      const res = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        id?: string;
        error?: string;
        details?: unknown;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate blueprint.");
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
      <PremiumThinkingOverlay show={isSubmitting} />

      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/2 top-[-140px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#e1b369]/10 blur-3xl" />
        <div className="absolute left-[10%] top-[40%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
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

        <p className="text-sm text-white/50 mb-4">Step {step} of 3</p>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {step === 1 ? (
            <StepOneOutcome
              formData={formData}
              setFormData={setFormData}
              next={next}
              canNext={canGoStep1}
            />
          ) : null}

          {step === 2 ? (
            <StepTwoAudience
              formData={formData}
              setFormData={setFormData}
              next={next}
              back={back}
              canNext={canGoStep2}
            />
          ) : null}

          {step === 3 ? (
            <StepThreeContext
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
   Step 1: Outcome + topic/text
   (This is your old Step 3, unchanged)
------------------------------ */
function StepOneOutcome({
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
   Step 2: Audience (unchanged from your old Step 2)
------------------------------ */
function StepTwoAudience({
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
          This shapes tone, pacing, and engagement.
        </p>
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
            Your name (optional)
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
   Step 3: Context + duration + constraints
   (This is your old Step 4, moved to step 3)
------------------------------ */
function StepThreeContext({
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
          Select up to two constraints so we can focus on the biggest hurdles.
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
              inputMode="numeric"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="text-sm text-white/70">Constraints (pick up to 2)</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ConstraintOptions.map((c) => {
            const selected = formData.constraintsSelected.includes(c);
            const atMax = !selected && formData.constraintsSelected.length >= 2;

            return (
              <CardButton
                key={c}
                selected={selected}
                disabled={atMax}
                onClick={() => {
                  setFormData((p) => {
                    const exists = p.constraintsSelected.includes(c);
                    if (exists) {
                      return {
                        ...p,
                        constraintsSelected: p.constraintsSelected.filter(
                          (x) => x !== c,
                        ),
                      };
                    }
                    if (p.constraintsSelected.length >= 2) return p;
                    return {
                      ...p,
                      constraintsSelected: [...p.constraintsSelected, c],
                    };
                  });
                }}
              >
                <div className="font-semibold">{c}</div>
                <div className="text-xs text-white/60 mt-1">
                  {selected ? "Selected" : atMax ? "Max 2 selected" : "Select"}
                </div>
              </CardButton>
            );
          })}
        </div>

        {formData.constraintsSelected.length ? (
          <p className="text-xs text-white/50">
            Selected: {formData.constraintsSelected.join(" · ")}
          </p>
        ) : null}
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
          {isSubmitting ? "Designing…" : "Generate Blueprint"}
        </button>
      </div>
    </div>
  );
}
