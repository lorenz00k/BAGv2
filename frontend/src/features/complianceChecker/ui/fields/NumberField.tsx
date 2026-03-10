"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";

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
  const t = useTranslations("common.labels");
  const errorId = useId();

  const [rawValue, setRawValue] = useState(
    value !== undefined ? String(value) : ""
  );
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setRawValue(value !== undefined ? String(value) : "");
  }, [value]);

  const visibleError = localError ?? error ?? null;

  function handleChange(raw: string) {
    setRawValue(raw);

    if (raw === "") {
      setLocalError(null);
      onChange(undefined);
      return;
    }

    const n = Number(raw);

    if (raw === "-" || !Number.isFinite(n) || n < min) {
      setLocalError(t("general.minValue", { value: min }));
      onChange(undefined);
      return;
    }

    setLocalError(null);
    onChange(n);
  }

  return (
    <div className="w-full">
      <Input
        type="number"
        inputMode={step % 1 !== 0 ? "decimal" : "numeric"}
        value={rawValue}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        aria-invalid={!!visibleError}
        aria-describedby={visibleError ? errorId : undefined}
        onChange={(e) => handleChange(e.target.value)}
        className={visibleError ? "!border-red-500" : undefined}
      />

      {visibleError ? (
        <p id={errorId} className="mt-2 text-sm text-red-600">
          {visibleError}
        </p>
      ) : null}
    </div>
  );
}