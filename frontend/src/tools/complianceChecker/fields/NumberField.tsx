"use client";

import { useTranslations } from "next-intl";

interface NumberFieldProps {
  /** Current value */
  value: number | undefined;
  /** Called when value changes */
  onChange: (value: number | undefined) => void;
  /** i18n key for the label */
  labelKey: string;
  /** i18n key for placeholder text */
  placeholderKey?: string;
}

export default function NumberField({
  value,
  onChange,
  labelKey,
  placeholderKey,
}: NumberFieldProps) {
  const t = useTranslations("sections.complianceChecker.form");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {t(labelKey)}
      </label>
      <input
        type="number"
        min={0}
        value={value ?? ""}
        placeholder={placeholderKey ? t(placeholderKey) : undefined}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(undefined);
          } else {
            const num = Number(raw);
            if (!isNaN(num) && num >= 0) {
              onChange(num);
            }
          }
        }}
        className="
          w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg
          text-sm text-gray-900 placeholder:text-gray-400
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 outline-none
        "
      />
    </div>
  );
}
