"use client";

import { useTranslations } from "next-intl";

type Props = {
  value?: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  error?: string | null;
};

export default function BooleanField({ value, onChange, disabled, error }: Props) {

  const g = useTranslations("common.labels.general");
  const baseClass = "rounded-lg border px-3 py-2 text-sm";
  const activeClass = "bg-black text-white border-black";
  const inactiveClass = error ? "border-red-500" : "border-neutral-300";

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <button
          type="button"
          className={`${baseClass} ${value === true ? activeClass : inactiveClass}`}
          disabled={disabled}
          aria-pressed={value === true}
          aria-invalid={!!error}
          onClick={() => onChange(true)}
        >
          {g("yes")}
        </button>

        <button
          type="button"
          className={`${baseClass} ${value === false ? activeClass : inactiveClass}`}
          disabled={disabled}
          aria-pressed={value === false}
          aria-invalid={!!error}
          onClick={() => onChange(false)}
        >
          {g("no")}
        </button>
      </div>

      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}