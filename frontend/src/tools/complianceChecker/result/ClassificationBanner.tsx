"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ClassificationType } from "../types";

// ---------------------------------------------------------------------------
// Color mapping per classification
// ---------------------------------------------------------------------------

const CLASSIFICATION_STYLES: Record<
  ClassificationType,
  {
    bg: string;
    border: string;
    icon: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  noFacility: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "ℹ️",
    accent: "text-blue-800",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  freistellungGFVO: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "✅",
    accent: "text-emerald-800",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  needsPermit: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "⚠️",
    accent: "text-red-800",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
  individualAssessment: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "🔍",
    accent: "text-amber-800",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ClassificationBannerProps {
  classification: ClassificationType;
  classificationKey: string;
  summaryKey: string;
  gfvoCategoryKey: string | undefined;
}

export default function ClassificationBanner({
  classification,
  classificationKey,
  summaryKey,
  gfvoCategoryKey,
}: ClassificationBannerProps) {
  const tClassifications = useTranslations(
    "sections.complianceResult.classifications"
  );
  const tGfvo = useTranslations("sections.complianceResult.gfvo");
  const tResult = useTranslations("pages.complianceResult");
  const style = CLASSIFICATION_STYLES[classification];

  // Extract the nested key (e.g. "noFacility.title" from "complianceResult.classifications.noFacility.title")
  const titleSuffix = classificationKey.replace(
    "complianceResult.classifications.",
    ""
  );
  const summarySuffix = summaryKey.replace(
    "complianceResult.classifications.",
    ""
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        rounded-2xl border ${style.border} ${style.bg}
        p-6 md:p-8 text-center
      `}
    >
      {/* Icon */}
      <div className="text-5xl mb-4">{style.icon}</div>

      {/* Badge */}
      <span
        className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${style.badgeBg} ${style.badgeText} mb-4`}
      >
        {tResult("resultBadge")}
      </span>

      {/* Title */}
      <h2 className={`text-2xl md:text-3xl font-bold ${style.accent} mb-3`}>
        {tClassifications(titleSuffix)}
      </h2>

      {/* Summary */}
      <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
        {tClassifications(summarySuffix)}
      </p>

      {/* GFVO category badge */}
      {gfvoCategoryKey && (
        <div className="mt-6">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <span className="text-emerald-600 font-bold text-lg">§</span>
            <span className="text-sm font-medium text-emerald-800">
              {tGfvo(
                gfvoCategoryKey.replace(
                  "complianceResult.gfvoCategories.",
                  "categories."
                )
              )}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
