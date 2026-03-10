"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { flow, type StepDef, type CheckerAnswers } from "../config/flow";
import { useComplianceChecker } from "../hooks/useComplianceChecker";
import StepRenderer from "./StepRenderer";

function visibleFields(step: StepDef, answers: Partial<CheckerAnswers>) {
  return step.fields.filter((f) => (f.when ? f.when(answers) : true));
}

function isEmptyForField(
  field: { kind: "radio" | "select" | "boolean" | "number" },
  value: unknown
) {
  switch (field.kind) {
    case "select":
    case "radio":
      return typeof value !== "string" || value.length === 0;
    case "number":
      return typeof value !== "number" || !Number.isFinite(value);
    case "boolean":
      return typeof value !== "boolean";
    default:
      return value === undefined || value === null;
  }
}

function isStepVisible(step: StepDef, answers: Partial<CheckerAnswers>) {
  if (step.when && !step.when(answers)) return false;
  return visibleFields(step, answers).length > 0;
}

function deriveVisibleSteps(answers: Partial<CheckerAnswers>) {
  return flow.filter((step) => isStepVisible(step, answers));
}

function deriveInitialStepIndex(answers: Partial<CheckerAnswers>) {
  const steps = deriveVisibleSteps(answers);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const fields = visibleFields(step, answers);
    const missing = fields.some((f) => isEmptyForField(f, answers[f.key]));
    if (missing) return i;
  }

  return Math.max(steps.length - 1, 0);
}

function buildPatchForStep(step: StepDef, values: Partial<CheckerAnswers>) {
  const patch: Partial<CheckerAnswers> = {};
  const fields = visibleFields(step, values);

  for (const f of fields) {
    const v = values[f.key];
    if (isEmptyForField(f, v)) continue;
    // @ts-expect-error dynamic key assign
    patch[f.key] = v;
  }

  return patch;
}

export default function ComplianceCheckerWizard() {
  const form = useTranslations("sections.complianceChecker.form");
  const actions = useTranslations("common.actions");
  const statusT = useTranslations("common.labels.status");
  const generalT = useTranslations("common.labels.general");

  const router = useRouter();
  const pathname = usePathname();

  const {
    status,
    error,
    answers,
    savePatch,
    runEvaluate,
    restart,
    clearFieldError,
    getFieldError,
  } = useComplianceChecker();

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Partial<CheckerAnswers>>({});
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const hasInitializedStep = useRef(false);

  const mergedForRender = useMemo(() => {
    return { ...answers, ...draft } as Partial<CheckerAnswers>;
  }, [answers, draft]);

  const visibleSteps = useMemo(() => {
    return deriveVisibleSteps(mergedForRender);
  }, [mergedForRender]);

  useEffect(() => {
    if (status === "loading") return;
    if (hasInitializedStep.current) return;

    setStepIndex(deriveInitialStepIndex(answers));
    hasInitializedStep.current = true;
  }, [status, answers]);

  useEffect(() => {
    setStepIndex((current) =>
      Math.min(current, Math.max(visibleSteps.length - 1, 0))
    );
  }, [visibleSteps.length]);

  const step = visibleSteps[Math.min(stepIndex, visibleSteps.length - 1)];
  const canGoBack = stepIndex > 0;
  const canGoNext = stepIndex < visibleSteps.length - 1;
  const busy = status === "loading" || status === "saving" || status === "evaluating";

  function getStepFieldError(key: string) {
    return stepErrors[key] ?? null;
  }

  function clearStepFieldError(key: string) {
    setStepErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateStep(step: StepDef, values: Partial<CheckerAnswers>) {
    const errors: Record<string, string> = {};
    const fields = visibleFields(step, values);

    for (const field of fields) {
      const value = values[field.key];
      if (isEmptyForField(field, value)) {
        errors[String(field.key)] = generalT("required");
      }
    }

    return errors;
  }

  async function handleNext() {
    const errors = validateStep(step, mergedForRender);

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});

    try {
      const patch = buildPatchForStep(step, mergedForRender);
      if (Object.keys(patch).length > 0) await savePatch(patch);

      setDraft({});
      setStepIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
    } catch { }
  }

  async function handleBack() {
    try {
      const patch = buildPatchForStep(step, mergedForRender);
      if (Object.keys(patch).length > 0) await savePatch(patch);

      setDraft({});
      setStepIndex((i) => Math.max(i - 1, 0));
    } catch { }
  }

  async function handleRestart() {
    await restart();
    setDraft({});
    setStepErrors({});
    setStepIndex(0);
    hasInitializedStep.current = false;
  }

  async function handleFinish() {
    const errors = validateStep(step, mergedForRender);

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});

    try {
      const patch = buildPatchForStep(step, mergedForRender);
      if (Object.keys(patch).length > 0) await savePatch(patch);

      await runEvaluate();
      router.push(`${pathname.replace(/\/result$/, "")}/result`);
    } catch { }
  }

  if (!step) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{form(step.titleKey)}</h1>
        {step.helperKey ? (
          <div className="mt-2 text-sm opacity-70">{form(step.helperKey)}</div>
        ) : null}

        <div className="mt-2 text-sm opacity-70">
          {stepIndex + 1} / {visibleSteps.length}
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border p-5">
        {status === "loading" ? (
          <div className="py-10 text-sm opacity-70">{statusT("loading")}</div>
        ) : (
          <StepRenderer
            step={step}
            answers={mergedForRender}
            onChange={(key, value) => {
              clearStepFieldError(String(key));
              setDraft((prev) => ({ ...prev, [key]: value }));
            }}
            disabled={busy}
            clearFieldError={clearFieldError}
            getFieldError={getFieldError}
            getClientFieldError={getStepFieldError}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          disabled={!canGoBack || busy}
          onClick={handleBack}
        >
          {actions("navigation.back")}
        </button>

        <div className="flex gap-3">
          {canGoNext ? (
            <button
              type="button"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={busy}
              onClick={handleNext}
            >
              {busy ? statusT("loading") : actions("navigation.next")}
            </button>
          ) : (
            <button
              type="button"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={busy}
              onClick={handleFinish}
            >
              {busy ? statusT("loading") : actions("navigation.finish")}
            </button>
          )}
        </div>

        <button type="button" disabled={busy} onClick={handleRestart}>
          {actions("check.restart")}
        </button>
      </div>
    </div>
  );
}