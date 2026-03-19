"use client";

import { useTranslations } from "next-intl";
import { Text } from "@/components/typography/Text";

type Props = {
  helperKey?: string;
  currentStep: number;
  totalSteps: number;
};

export default function ComplianceCheckerProgress({ helperKey, currentStep, totalSteps }: Props) {

  const form = useTranslations("sections.complianceChecker.form");
  const actions = useTranslations("common.actions");

  return (
    <div>
      {helperKey ? (
        <Text size="base" tone="muted">
          {form(helperKey)}
        </Text>
      ) : null}

      <div className="mt-4 space-y-2">
        <Text size="sm" tone="muted" className="mt-0">
          {actions("check.progress.step")} {currentStep} {actions("check.progress.of")} {totalSteps}
        </Text>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}