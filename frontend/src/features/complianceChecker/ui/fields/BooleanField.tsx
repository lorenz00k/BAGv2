"use client";

import { useTranslations } from "next-intl";

type Props = {
  value?: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export default function BooleanField({ value, onChange, disabled }: Props) {

    const g = useTranslations("common.labels.general");

  return (
    <div className="flex gap-2">
      <button
        type="button"
        className={`rounded-lg border px-3 py-2 text-sm ${value === true ? "bg-black text-white" : ""}`}
        disabled={disabled}
        onClick={() => onChange(true)}
      >
        {g("yes")}
      </button>
      <button
        type="button"
        className={`rounded-lg border px-3 py-2 text-sm ${value === false ? "bg-black text-white" : ""}`}
        disabled={disabled}
        onClick={() => onChange(false)}
      >
        {g("no")}
      </button>
    </div>
  );
}