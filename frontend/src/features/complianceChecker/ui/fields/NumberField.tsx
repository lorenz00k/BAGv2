"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  value?: number;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  error?: string | null;
  min?: number;
  step?: number;
};

export default function NumberField({
  value,
  placeholder,
  onChange,
  disabled,
  error,
  min = 0,
  step = 1,
}: Props) {

  const label = useTranslations("common.labels");

  const [rawValue, setRawValue] = useState(value !== undefined ? String(value) : "");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setRawValue(value !== undefined ? String(value) : "");
  }, [value]);

  const visibleError = localError ?? error ?? null;

  return (
    <div className="w-full">
      <input
        type="number"
        inputMode="numeric"
        className={`w-full rounded-lg border px-3 py-2 text-sm ${visibleError ? "border-red-500" : ""
          }`}
        value={rawValue}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        aria-invalid={!!visibleError}
        onChange={(e) => {
          const raw = e.target.value;
          setRawValue(raw);

          if (raw === "") {
            setLocalError(null);
            onChange(undefined);
            return;
          }
          const n = Number(raw);
          if (raw === "-" || !Number.isFinite(n) || n < min) {
            setLocalError(label("general.minValue", { value: min }));
            onChange(undefined);
            return;
          }

          setLocalError(null);
          onChange(n);
        }}
      />

      {visibleError ? <p className="mt-1 text-sm text-red-600">{visibleError}</p> : null}
    </div>
  );
}