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
import { Container } from "@/components/layout/Container";

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

function applyAnswerChange<K extends keyof CheckerAnswers>(
  current: Partial<CheckerAnswers>,
  key: K,
  value: CheckerAnswers[K]
): Partial<CheckerAnswers> {
  return cleanupDependentAnswers({
    ...current,
    [key]: value,
  });
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
  const hasInitializedFromServer = useRef(false);


  const visibleSteps = useMemo(
    () => deriveVisibleSteps(draft),
    [draft]
  );

  useEffect(() => {
    if (status !== "ready") return;
    if (hasInitializedFromServer.current) return;

    const initialDraft = cleanupDependentAnswers(answers);
    setDraft(initialDraft);
    setStepIndex(deriveInitialStepIndex(initialDraft));
    hasInitializedFromServer.current = true;
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
    status === "idle" ||
    status === "loading" ||
    status === "saving" ||
    status === "evaluating";

  const currentStep = step ? stepIndex + 1 : 0;
  const totalSteps = visibleSteps.length;
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

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
    const cleanedValues = cleanupDependentAnswers(draft);
    await saveAnswers(cleanedValues);
    setDraft(cleanedValues);
    return cleanedValues;
  }

  async function handleNext() {
    if (!step) return;

    const cleanedValues = cleanupDependentAnswers(draft);
    const errors = validateStep(step, cleanedValues);

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});

    try {
      await saveAnswers(cleanedValues);
      setDraft(cleanedValues);
      setStepIndex((i) => Math.min(i + 1, visibleSteps.length - 1));
    } catch (err) {
      console.error("Failed to handle next", err);
    }
  }

  async function handleBack() {
    try {
      await persistDraftState();
      setStepIndex((i) => Math.max(i - 1, 0));
    } catch (err) {
      console.error("Failed to handle back", err);
    }
  }

  async function handleRestart() {
    try {
      await restart();
      setDraft({});
      setStepErrors({});
      setStepIndex(0);
      hasInitializedFromServer.current = false;
    } catch (err) {
      console.error("Failed to restart checker", err);
    }

  }

  async function handleFinish() {
    if (!step) return;

    const cleanedValues = cleanupDependentAnswers(draft);
    const errors = validateStep(step, cleanedValues);

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }

    setStepErrors({});

    try {
      await saveAnswers(cleanedValues);
      setDraft(cleanedValues);
      await runEvaluate();
      router.push(`${pathname.replace(/\/result$/, "")}/result`);
    } catch (err) {
      console.error("Failed to save step", err);
    }
  }

  if (!step) return null;

  return (
    <Container>
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

          <div className="mt-4 space-y-2">
            <Text size="sm" tone="muted" className="mt-0">
              {actions("check.progress.step")} {currentStep} {actions("check.progress.of")} {totalSteps}
            </Text>

            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
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
          {busy ? (
            <Text size="sm" tone="muted" className="py-10">
              {statusT("loading")}
            </Text>
          ) : (
            <StepRenderer
              step={step}
              answers={draft}
              onChange={(key, value) => {
                clearStepFieldError(String(key));
                clearFieldError(String(key));

                setDraft((prev) =>
                  applyAnswerChange(
                    prev,
                    key,
                    value as CheckerAnswers[typeof key]
                  )
                );
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
    </Container>
  );
}