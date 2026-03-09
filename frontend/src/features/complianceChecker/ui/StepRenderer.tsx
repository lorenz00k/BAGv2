"use client";

import { useTranslations } from "next-intl";
import type { StepDef, CheckerAnswers, AnswerKey, FieldDef } from "../config/flow";
import FieldRenderer from "./fields/FieldRenderer";

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
      {fields.map((field) => (
        <div key={String(field.key)} className="space-y-2">
          <div className="text-sm font-medium">{form(field.labelKey)}</div>
          {field.helperKey ? <div className="text-sm opacity-70">{form(field.helperKey)}</div> : null}

          <FieldRenderer
            field={field}
            value={answers[field.key]}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
            clearFieldError={clearFieldError}
            getFieldError={getFieldError}
            clientError={getClientFieldError?.(String(field.key)) ?? null}
          />
        </div>
      ))}
    </div>
  );
}