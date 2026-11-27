"use client";

import { useTranslations } from "next-intl";
import type { FieldDef } from "../../config/flow";
import BooleanField from "./BooleanField";
import OptionsField from "./OptionsField";
import NumberField from "./NumberField";

type Props = {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  clearFieldError?: (field: string) => void;
  getFieldError?: (field: string) => string | null;
  clientError?: string | null;
};

export default function FieldRenderer({
  field,
  value,
  onChange,
  disabled,
  clearFieldError,
  getFieldError,
  clientError,
}: Props) {
  const form = useTranslations("sections.complianceChecker.form");
  const fieldKey = String(field.key);
  const error = clientError ?? getFieldError?.(fieldKey) ?? null;

  function handleChange(nextValue: unknown) {
    clearFieldError?.(fieldKey);
    onChange(nextValue);
  }

  switch (field.kind) {
    case "boolean":
      return (
        <BooleanField
          value={typeof value === "boolean" ? value : undefined}
          onChange={handleChange}
          disabled={disabled}
          error={error}
        />
      );

    case "number":
      return (
        <NumberField
          value={typeof value === "number" ? value : undefined}
          placeholder={field.placeholderKey ? form(field.placeholderKey) : undefined}
          onChange={handleChange}
          disabled={disabled}
          error={error}
          min={field.min ?? 0}
          step={field.step ?? 1}
        />
      );

    case "select":
    case "radio":
      return (
        <OptionsField
          field={field}
          kind={field.kind}
          value={typeof value === "string" ? value : undefined}
          onChange={handleChange}
          disabled={disabled}
          error={error}
        />
      );

    default:
      return null;
  }
}