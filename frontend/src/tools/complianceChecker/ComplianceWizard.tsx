"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import * as checksApi from "@/services/checks";
import type { ComplianceFormData, WizardState } from "./types";
import { getVisibleSteps } from "./steps";
import WizardProgress from "./WizardProgress";
import WizardStep from "./WizardStep";

// ---------------------------------------------------------------------------
// Auth gate component
// ---------------------------------------------------------------------------

function AuthGate() {
  const t = useTranslations("pages.complianceChecker");
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
      <div className="mx-auto max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100 text-center">
          <div className="mb-4 text-5xl">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t("auth.loginRequired")}
          </h2>
          <p className="text-gray-600 mb-8">
            {t("auth.loginDescription")}
          </p>
          <a
            href={`/${locale}/login`}
            className="
              inline-flex items-center gap-2 rounded-xl px-8 py-3.5
              bg-gradient-to-r from-blue-600 to-blue-700 text-white
              font-semibold text-sm
              hover:from-blue-700 hover:to-blue-800
              transition-all duration-200 shadow-lg hover:shadow-xl
            "
          >
            {t("auth.loginButton")}
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export default function ComplianceWizard() {
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("pages.complianceChecker");
  const router = useRouter();
  const locale = useLocale();

  // --- State ---
  const [formData, setFormData] = useState<ComplianceFormData>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checkId, setCheckId] = useState<string | null>(null);
  const [wizardState, setWizardState] = useState<WizardState>("idle");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Refs for auto-save debouncing ---
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestFormDataRef = useRef(formData);
  latestFormDataRef.current = formData;

  // --- Derived ---
  const visibleSteps = getVisibleSteps(formData);
  const currentStep = visibleSteps[currentStepIndex];
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  // --- Create check on mount ---
  useEffect(() => {
    if (!user || checkId) return;

    checksApi
      .createCheck({}, "0")
      .then((check) => setCheckId(check.id))
      .catch(() => setErrorMessage(t("errors.createFailed")));
  }, [user, checkId, t]);

  // --- Auto-save (debounced) ---
  const saveToBackend = useCallback(async () => {
    if (!checkId) return;

    try {
      setWizardState("saving");
      await checksApi.updateCheck(checkId, {
        formData: latestFormDataRef.current,
        currentStep: String(currentStepIndex),
      });
      setWizardState("idle");
    } catch {
      // Silent fail for auto-save — data is still in local state
      setWizardState("idle");
    }
  }, [checkId, currentStepIndex]);

  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(saveToBackend, 500);
  }, [saveToBackend]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // --- Field change handler ---
  const handleFieldChange = useCallback(
    (key: keyof ComplianceFormData, value: unknown) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      debouncedSave();
    },
    [debouncedSave]
  );

  // --- Navigation ---
  const handleNext = useCallback(async () => {
    // Save current step immediately before advancing
    if (checkId) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      try {
        setWizardState("saving");
        await checksApi.updateCheck(checkId, {
          formData,
          currentStep: String(currentStepIndex + 1),
        });
        setWizardState("idle");
      } catch {
        setWizardState("idle");
      }
    }

    setDirection("forward");
    setCurrentStepIndex((prev) =>
      Math.min(prev + 1, visibleSteps.length - 1)
    );
  }, [checkId, formData, currentStepIndex, visibleSteps.length]);

  const handleBack = useCallback(() => {
    setDirection("backward");
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback(
    (index: number) => {
      if (index < currentStepIndex) {
        setDirection("backward");
        setCurrentStepIndex(index);
      }
    },
    [currentStepIndex]
  );

  // --- Evaluate ---
  const handleEvaluate = useCallback(async () => {
    if (!checkId) return;

    // Save final step data first
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    try {
      setWizardState("evaluating");
      setErrorMessage(null);

      await checksApi.updateCheck(checkId, {
        formData,
        currentStep: String(currentStepIndex),
      });

      await checksApi.evaluateCheck(checkId);

      // Navigate to result page
      router.push(`/${locale}/complianceChecker/result?id=${checkId}`);
    } catch {
      setWizardState("error");
      setErrorMessage(t("errors.evaluateFailed"));
    }
  }, [checkId, formData, currentStepIndex, router, locale, t]);

  // --- Auth loading ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // --- Auth gate ---
  if (!user) {
    return <AuthGate />;
  }

  // --- Wizard UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
              {t("badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              {t("title")}
            </h1>
            <p className="text-gray-500 text-lg">
              {t("subtitle")}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-10">
            <WizardProgress
              steps={visibleSteps}
              currentIndex={currentStepIndex}
              onStepClick={handleStepClick}
            />
            <p className="text-sm text-gray-500 mt-3 text-center">
              {t("progress", {
                current: currentStepIndex + 1,
                total: visibleSteps.length,
              })}
            </p>
          </div>

          {/* Step content */}
          <div className="min-h-[300px] mb-8">
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep && (
                <WizardStep
                  key={currentStep.id}
                  step={currentStep}
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  direction={direction}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Error message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className={`
                flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold
                transition-all duration-200
                ${
                  currentStepIndex === 0
                    ? "opacity-0 pointer-events-none"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              {t("navigation.back")}
            </button>

            <div className="flex items-center gap-3">
              {/* Save indicator */}
              {wizardState === "saving" && (
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <div className="h-3 w-3 animate-spin rounded-full border border-blue-400 border-t-transparent" />
                  {t("status.saving")}
                </span>
              )}

              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={wizardState === "evaluating"}
                  className="
                    flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold
                    bg-gradient-to-r from-blue-600 to-blue-700 text-white
                    hover:from-blue-700 hover:to-blue-800
                    transition-all duration-200
                    shadow-lg hover:shadow-xl
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {wizardState === "evaluating" ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t("navigation.evaluating")}
                    </>
                  ) : (
                    t("navigation.evaluate")
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="
                    flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold
                    bg-gradient-to-r from-blue-600 to-blue-700 text-white
                    hover:from-blue-700 hover:to-blue-800
                    transition-all duration-200
                    shadow-lg hover:shadow-xl
                  "
                >
                  {t("navigation.next")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
