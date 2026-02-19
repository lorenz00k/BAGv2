"use client";

import { useTranslations } from "next-intl";

interface RadioFieldProps {
  /** Currently selected value */
  value: string | undefined;
  /** Called when user selects an option */
  onChange: (value: string) => void;
  /** i18n prefix for options object (e.g. "form.sector.options") */
  optionsKey: string;
  /** i18n prefix for option descriptions (optional) */
  descriptionsKey?: string;
}

export default function RadioField({
  value,
  onChange,
  optionsKey,
  descriptionsKey,
}: RadioFieldProps) {
  const t = useTranslations("sections.complianceChecker");

  // Get the options object from i18n (e.g. { retail: "Handel", office: "Büro", ... })
  const rawOptions = t.raw(optionsKey) as Record<string, string>;
  const entries = Object.entries(rawOptions);

  // Get descriptions if provided
  const descriptions = descriptionsKey
    ? (t.raw(descriptionsKey) as Record<string, string>)
    : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {entries.map(([key, label]) => {
        const isSelected = value === key;
        const description = descriptions?.[key];

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`
              group relative flex items-start gap-3 p-4 rounded-xl border-2
              text-left text-sm transition-all duration-200
              hover:scale-[1.02] hover:shadow-md
              ${
                isSelected
                  ? "border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
              }
            `}
          >
            {/* Radio indicator */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5 ${
                isSelected
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-300 group-hover:border-blue-400"
              }`}
            >
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>

            {/* Label + Description */}
            <div className="flex flex-col gap-0.5">
              <span
                className={`font-medium ${
                  isSelected ? "text-blue-900" : "text-gray-700"
                }`}
              >
                {label}
              </span>
              {description && (
                <span className="text-xs text-gray-500 leading-relaxed">
                  {description}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
