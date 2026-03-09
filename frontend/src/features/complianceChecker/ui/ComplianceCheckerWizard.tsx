"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { flow, type StepDef, type CheckerAnswers } from "../config/flow";
import { useComplianceChecker } from "../hooks/useComplianceChecker";
import StepRenderer from "./StepRenderer";

function visibleFields(step: StepDef, answers: Partial<CheckerAnswers>) {
  return step.fields.filter((f) => (f.when ? f.when(answers) : true));
}

function isEmptyForField(field: { kind: "radio" | "select" | "boolean" | "number" }, value: unknown) {
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

function deriveInitialStepIndex(answers: Partial<CheckerAnswers>) {
  for (let i = 0; i < flow.length; i++) {
    const step = flow[i];
    const fields = visibleFields(step, answers);
    const missing = fields.some((f) => isEmptyForField(f, answers[f.key]));
    if (missing) return i;
  }
  return 0;
}

function buildPatchForStep(step: StepDef, draft: Partial<CheckerAnswers>) {
  const patch: Partial<CheckerAnswers> = {};
  const fields = visibleFields(step, draft);

  for (const f of fields) {
    const v = draft[f.key];
    if (isEmptyForField(f, v)) continue;
    // @ts-expect-error dynamic key assign
    patch[f.key] = v;
  }
  return patch;
}

export default function ComplianceCheckerWizard() {
  const form = useTranslations("sections.complianceChecker.form");
  const nav = useTranslations("common.actions.navigation");
  const statusT = useTranslations("common.labels.status");

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

  const initialStep = useMemo(() => deriveInitialStepIndex(answers), [answers]);
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [draft, setDraft] = useState<Partial<CheckerAnswers>>({});

  const step = flow[Math.min(stepIndex, flow.length - 1)];

  const mergedForRender = useMemo(() => {
    return { ...answers, ...draft } as Partial<CheckerAnswers>;
  }, [answers, draft]);

  const canGoBack = stepIndex > 0;
  const canGoNext = stepIndex < flow.length - 1;

  async function handleNext() {
    const patch = buildPatchForStep(step, mergedForRender);
    if (Object.keys(patch).length > 0) await savePatch(patch);
    setDraft({});
    setStepIndex((i) => Math.min(i + 1, flow.length - 1));
  }

  async function handleBack() {
    const patch = buildPatchForStep(step, mergedForRender);
    if (Object.keys(patch).length > 0) await savePatch(patch);
    setDraft({});
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleRestart() {
    await restart();
    setDraft({});
    setStepIndex(0);
  }

  async function handleFinish() {
    const patch = buildPatchForStep(step, mergedForRender);
    if (Object.keys(patch).length > 0) await savePatch(patch);
    await runEvaluate();
    router.push(`${pathname.replace(/\/result$/, "")}/result`);
  }

  const busy = status === "loading" || status === "saving" || status === "evaluating";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{form(step.titleKey)}</h1>
        {step.helperKey ? (
          <div className="mt-2 text-sm opacity-70">{form(step.helperKey)}</div>
        ) : null}

        {/* Progress erstmal ohne i18n-key, kannst du später leicht in messages packen */}
        <div className="mt-2 text-sm opacity-70">
          {stepIndex + 1} / {flow.length}
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
            onChange={(key, value) => setDraft((prev) => ({ ...prev, [key]: value }))}
            disabled={busy}
            clearFieldError={clearFieldError}
            getFieldError={getFieldError}
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
          {nav("back")}
        </button>

        <div className="flex gap-3">
          {canGoNext ? (
            <button
              type="button"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={busy}
              onClick={handleNext}
            >
              {busy ? statusT("loading") : nav("next")}
            </button>
          ) : (
            <button
              type="button"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={busy}
              onClick={handleFinish}
            >
              {busy ? statusT("loading") : nav("finish")}
            </button>
          )}
        </div>

        <button type="button"
          disabled={busy}
          onClick={handleRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}