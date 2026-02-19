"use client";

import { useTranslations } from "next-intl";

interface BooleanFieldProps {
  /** Current value */
  value: "yes" | "no" | undefined;
  /** Called when user selects */
  onChange: (value: "yes" | "no") => void;
  /** i18n key for the question */
  labelKey: string;
}

export default function BooleanField({
  value,
  onChange,
  labelKey,
}: BooleanFieldProps) {
  const t = useTranslations("sections.complianceChecker");

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-gray-700">
        {t(labelKey)}
      </span>

      <div className="grid grid-cols-2 gap-3 max-w-xs">
        {(["yes", "no"] as const).map((choice) => {
          const isSelected = value === choice;

          return (
            <button
              key={choice}
              type="button"
              onClick={() => onChange(choice)}
              className={`
                flex items-center justify-center gap-2 p-4 rounded-xl border-2
                text-sm font-medium transition-all duration-200
                hover:scale-[1.02] hover:shadow-md
                ${
                  isSelected
                    ? "border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md text-blue-900"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-gray-700"
                }
              `}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isSelected
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {isSelected && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>
              {t(`options.${choice}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
