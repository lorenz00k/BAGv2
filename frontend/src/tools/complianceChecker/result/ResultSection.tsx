"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface ResultSectionProps {
  /** Section label (e.g. "Zuständigkeit & Verfahren") */
  title: string;
  /** i18n keys to resolve for each item in this section */
  itemKeys: string[];
  /** Translation namespace for resolving item keys */
  translationNamespace: string;
  /**
   * Transform a backend key into the nested i18n path within the namespace.
   * Default: strips `complianceResult.` prefix.
   */
  keyTransformer?: (key: string) => string;
  /** Whether the section starts expanded (default: true) — kept for API compat */
  defaultExpanded?: boolean;
  /** Accent color for the dot markers */
  accentColor?: string;
}

/**
 * Default key transformer: strips the `complianceResult.` prefix.
 * Example: `complianceResult.procedural.authority` → `procedural.authority`
 */
function defaultTransformer(key: string): string {
  return key.replace(/^complianceResult\./, "");
}

export default function ResultSection({
  title,
  itemKeys,
  translationNamespace,
  keyTransformer = defaultTransformer,
  accentColor = "#3b82f6",
}: ResultSectionProps) {
  const t = useTranslations(translationNamespace);

  if (itemKeys.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm"
    >
      {/* Section title */}
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span
          className="inline-block w-1 h-6 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        {title}
      </h3>

      {/* Items list */}
      <ul className="space-y-3">
        {itemKeys.map((key) => {
          const nestedKey = keyTransformer(key);

          return (
            <li
              key={key}
              className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <span>{t(nestedKey)}</span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
