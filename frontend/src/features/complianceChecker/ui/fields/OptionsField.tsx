"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import type { FieldDef } from "../../config/flow";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/typography/Text";

type Props = {
  field: FieldDef;
  kind: "select" | "radio";
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
};

export default function OptionsField({
  field,
  kind,
  value,
  onChange,
  disabled,
  error,
}: Props) {
  const form = useTranslations("sections.complianceChecker.form");
  const errorId = useId();

  const opts = field.options ?? [];
  const emptyOptionLabel = "—";

  const labelOf = (opt: string) =>
    field.optionLabelPrefix ? form(`${field.optionLabelPrefix}.${opt}`) : opt;

  const descOf = (opt: string) =>
    field.optionDescriptionPrefix
      ? form(`${field.optionDescriptionPrefix}.${opt}`)
      : null;

  if (kind === "select") {
    return (
      <div className="w-full">
        <Select
          value={value ?? ""}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "!border-red-500" : undefined}
        >
          <option value="" disabled>
            {emptyOptionLabel}
          </option>

          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {labelOf(opt)}
            </option>
          ))}
        </Select>

        {error ? (
          <Text id={errorId} size="sm" className="mt-2 text-red-600">
            {error}
          </Text>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className="space-y-2"
        role="radiogroup"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      >
        {opts.map((opt) => {
          const selected = value === opt;
          const description = descOf(opt);
          const showErrorState = !!error && value === undefined;

          return (
            <Button
              key={opt}
              type="button"
              variant="choice"
              selected={selected}
              disabled={disabled}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt)}
              className={`w-full justify-start text-left ${showErrorState ? "!border-red-500" : ""
                }`}
            >
              <span className="flex flex-col items-start">
                <span>{labelOf(opt)}</span>

                {description ? (
                  <span className="mt-0.5 text-xs opacity-70">
                    {description}
                  </span>
                ) : null}
              </span>
            </Button>
          );
        })}
      </div>

      {error ? (
        <Text id={errorId} size="sm" className="mt-2 text-red-600">
          {error}
        </Text>
      ) : null}
    </div>
  );
}