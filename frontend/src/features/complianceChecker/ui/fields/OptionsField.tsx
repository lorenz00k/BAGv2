"use client";

import { useTranslations } from "next-intl";
import type { FieldDef } from "../../config/flow";

type Props = {
  field: FieldDef;
  kind: "select" | "radio";
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
};

export default function OptionsField({ field, kind, value, onChange, disabled, error }: Props) {
  const form = useTranslations("sections.complianceChecker.form");

  const opts = field.options ?? []; // <- kommt aus flow.ts

  const labelOf = (opt: string) =>
    field.optionLabelPrefix ? form(`${field.optionLabelPrefix}.${opt}`) : opt;

  const descOf = (opt: string) =>
    field.optionDescriptionPrefix ? form(`${field.optionDescriptionPrefix}.${opt}`) : null;

  if (kind === "select") {
    return (
      <div className="w-full">
        <select
          className={`w-full rounded-lg border px-3 py-2 text-sm ${error ? "border-red-500" : ""
            }`}
          value={value ?? ""}
          disabled={disabled}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            —
          </option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {labelOf(opt)}
            </option>
          ))}
        </select>

        {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`space-y-2 rounded-xl p-1 ${error ? "border border-red-500" : "border border-transparent"
          }`}
      >
        {opts.map((opt) => (
          <label key={opt} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name={String(field.key)}
              value={opt}
              checked={value === opt}
              aria-invalid={!!error}
              disabled={disabled}
              onChange={() => onChange(opt)}
            />
            <div>
              <div>{labelOf(opt)}</div>
              {field.optionDescriptionPrefix ? (
                <div className="mt-0.5 text-xs opacity-70">{descOf(opt)}</div>
              ) : null}
            </div>
          </label>
        ))}
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}