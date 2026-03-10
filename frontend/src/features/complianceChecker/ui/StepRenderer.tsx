"use client";

import { useTranslations } from "next-intl";
import type {
  StepDef,
  CheckerAnswers,
  AnswerKey,
  FieldDef,
} from "../config/flow";
import FieldRenderer from "./fields/FieldRenderer";
import { Text } from "@/components/typography/Text";

type Props = {
  step: StepDef;
  answers: Partial<CheckerAnswers>;
  onChange: (key: AnswerKey, value: unknown) => void;
  disabled?: boolean;
  clearFieldError?: (field: string) => void;
  getFieldError?: (field: string) => string | null;
  getClientFieldError?: (field: string) => string | null;
};

function isVisible(field: FieldDef, answers: Partial<CheckerAnswers>) {
  return field.when ? field.when(answers) : true;
}

export default function StepRenderer({
  step,
  answers,
  onChange,
  disabled,
  clearFieldError,
  getFieldError,
  getClientFieldError,
}: Props) {
  const form = useTranslations("sections.complianceChecker.form");

  const fields = step.fields.filter((f) => isVisible(f, answers));

  return (
    <div className="space-y-6">
      {fields.map((field) => {
        const fieldKey = String(field.key);
        const clientError = getClientFieldError?.(fieldKey) ?? null;
        const helperText = field.helperKey ? form(field.helperKey) : null;

        return (
          <section key={fieldKey} className="space-y-2">
            <div className="space-y-1">
              <div className="text-sm font-medium text-[var(--color-fg)]">
                {form(field.labelKey)}
              </div>

              {helperText ? (
                <Text size="sm" tone="muted" className="mt-0">
                  {helperText}
                </Text>
              ) : null}
            </div>

            <FieldRenderer
              field={field}
              value={answers[field.key]}
              onChange={(value) => onChange(field.key, value)}
              disabled={disabled}
              clearFieldError={clearFieldError}
              getFieldError={getFieldError}
              clientError={clientError}
            />
          </section>
        );
      })}
    </div>
  );
}