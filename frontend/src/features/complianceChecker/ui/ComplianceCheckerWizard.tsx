"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { flow, type StepDef, type CheckerAnswers } from "../config/flow";
import { useComplianceChecker } from "../hooks/useComplianceChecker";
import StepRenderer from "./StepRenderer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/typography/Heading";
import { Text } from "@/components/typography/Text";

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

function cleanupDependentAnswers(
  values: Partial<CheckerAnswers>
): Partial<CheckerAnswers> {
  const next = { ...values };

  if (next.sector !== "gastronomyHotel") {
    delete next.hospitalitySubtype;
  }

  if (next.sector !== "workshop") {
    delete next.workshopSubtype;
  }

  const needsAccommodationDetails =
    next.sector === "accommodation" || next.hospitalitySubtype === "beherbergung";

  if (!needsAccommodationDetails) {
    delete next.bedCount;
    delete next.buildingUseExclusive;
    delete next.hasWellnessFacilities;
    delete next.servesFullMeals;
  }

  return next;
}

function setAnswer<K extends keyof CheckerAnswers>(
  target: Partial<CheckerAnswers>,
  key: K,
  value: CheckerAnswers[K]
) {
  target[key] = value;
}

function applyAnswerChange<K extends keyof CheckerAnswers>(
  current: Partial<CheckerAnswers>,
  key: K,
  value: CheckerAnswers[K]
): Partial<CheckerAnswers> {
  const next = { ...current };
  setAnswer(next, key, value);
  return cleanupDependentAnswers(next);
}

function buildDraftFromAnswersDiff(
  base: Partial<CheckerAnswers>,
  next: Partial<CheckerAnswers>
): Partial<CheckerAnswers> {
  const draft: Partial<CheckerAnswers> = {};

  for (const key of Object.keys(next) as Array<keyof CheckerAnswers>) {
    const value = next[key];

    if (base[key] !== value && value !== undefined) {
      setAnswer(draft, key, value);
    }
  }

  return draft;
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
    saveAnswers,
    runEvaluate,
    restart,
    clearFieldError,
    getFieldError,
  } = useComplianceChecker();

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Partial<CheckerAnswers>>({});
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const hasInitializedStep = useRef(false);

  const mergedForRender = useMemo(
    () => ({ ...answers, ...draft } as Partial<CheckerAnswers>),
    [answers, draft]
  );

  const visibleSteps = useMemo(
    () => deriveVisibleSteps(mergedForRender),
    [mergedForRender]
  );

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
  const busy =
    status === "loading" || status === "saving" || status === "evaluating";

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

  async function persistDraftState() {
    const cleanedValues = cleanupDependentAnswers(mergedForRender);
    await saveAnswers(cleanedValues);
    setDraft({});
    return cleanedValues;
  }

  async function handleNext() {
    const errors = validateStep(step, mergedForRender);

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});

    try {
      await persistDraftState();
      setStepIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
    } catch { }
  }

  async function handleBack() {
    try {
      await persistDraftState();
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
    const initialErrors = validateStep(step, mergedForRender);

    if (Object.keys(initialErrors).length > 0) {
      setStepErrors(initialErrors);
      return;
    }

    setStepErrors({});

    try {
      const cleanedValues = cleanupDependentAnswers(mergedForRender);
      const finalErrors = validateStep(step, cleanedValues);

      if (Object.keys(finalErrors).length > 0) {
        setStepErrors(finalErrors);
        return;
      }

      await saveAnswers(cleanedValues);
      setDraft({});
      await runEvaluate();
      router.push(`${pathname.replace(/\/result$/, "")}/result`);
    } catch { }
  }

  if (!step) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <Heading as="h1" className="mt-0">
          {form(step.titleKey)}
        </Heading>

        {step.helperKey ? (
          <Text size="sm" tone="muted">
            {form(step.helperKey)}
          </Text>
        ) : null}

        <Text size="sm" tone="muted">
          {stepIndex + 1} / {visibleSteps.length}
        </Text>
      </div>

      {error ? (
        <Card
          variant="subtle"
          className="mb-6 gap-2 border-red-300 bg-red-50 p-4 text-red-800 hover:translate-y-0"
        >
          <Text size="sm" className="mt-0 text-red-800">
            {error}
          </Text>
        </Card>
      ) : null}

      <Card
        variant="subtle"
        className="p-5 hover:translate-y-0 hover:shadow-[var(--shadow-xs)]"
      >
        {status === "loading" ? (
          <Text size="sm" tone="muted" className="py-10">
            {statusT("loading")}
          </Text>
        ) : (
          <StepRenderer
            step={step}
            answers={mergedForRender}
            onChange={(key, value) => {
              clearStepFieldError(String(key));
              clearFieldError(String(key));

              setDraft((prevDraft) => {
                const current = {
                  ...answers,
                  ...prevDraft,
                } as Partial<CheckerAnswers>;

                const cleaned = applyAnswerChange(
                  current,
                  key,
                  value as CheckerAnswers[typeof key]
                );

                return buildDraftFromAnswersDiff(answers, cleaned);
              });
            }}
            disabled={busy}
            clearFieldError={clearFieldError}
            getFieldError={getFieldError}
            getClientFieldError={getStepFieldError}
          />
        )}
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="previous"
            disabled={!canGoBack || busy}
            onClick={handleBack}
          >
            {actions("navigation.back")}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={handleRestart}
          >
            {actions("check.restart")}
          </Button>
        </div>

        {canGoNext ? (
          <Button
            type="button"
            variant="next"
            disabled={busy}
            onClick={handleNext}
          >
            {busy ? statusT("loading") : actions("navigation.next")}
          </Button>
        ) : (
          <Button
            type="button"
            variant="next"
            disabled={busy}
            onClick={handleFinish}
          >
            {busy ? statusT("loading") : actions("navigation.finish")}
          </Button>
        )}
      </div>
    </div>
  );
}