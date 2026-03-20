"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import * as checksApi from "@/services/checks";
import type { ComplianceResult } from "../types";
import ClassificationBanner from "./ClassificationBanner";
import ResultSection from "./ResultSection";

// ---------------------------------------------------------------------------
// Key transformers for different i18n JSON structures
// ---------------------------------------------------------------------------

/**
 * reasons.json: `complianceResult.reasons.X` → `items.X`
 * Structure: { title, items: { externalVentilation: "..." } }
 */
function reasonKeyTransformer(key: string): string {
  return key.replace("complianceResult.reasons.", "items.");
}

/**
 * content.json: `complianceResult.X.Y` → `X.Y`
 * Structure: { procedural: { authority: "..." }, documents: { general: { ... } } }
 */
function contentKeyTransformer(key: string): string {
  return key.replace("complianceResult.", "");
}

// ---------------------------------------------------------------------------
// Stagger animation
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type PageState = "loading" | "error" | "success";

export default function ResultPage() {
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("pages.complianceResult");
  const tLabels = useTranslations("sections.complianceResult.labels");
  const tDisclaimer = useTranslations("sections.complianceResult.disclaimer");

  const checkId = searchParams.get("id");

  const [pageState, setPageState] = useState<PageState>("loading");
  const [result, setResult] = useState<ComplianceResult | null>(null);

  // Load check data
  useEffect(() => {
    if (!user || !checkId) return;

    checksApi
      .getCheck(checkId)
      .then((c) => {
        const r = c.formData.result;
        if (!r) {
          router.push(`/${locale}/complianceChecker`);
          return;
        }
        setResult(r);
        setPageState("success");
      })
      .catch(() => setPageState("error"));
  }, [user, checkId, router, locale]);

  // --- Auth loading ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // --- Not logged in ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
        <div className="mx-auto max-w-lg">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100 text-center">
            <div className="mb-4 text-5xl">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t("auth.loginRequired")}
            </h2>
            <p className="text-gray-600 mb-8">
              {t("auth.loginDescription")}
            </p>
            <a
              href={`/${locale}/login`}
              className="
                inline-flex items-center gap-2 rounded-xl px-8 py-3.5
                bg-gradient-to-r from-blue-600 to-blue-700 text-white
                font-semibold text-sm
                hover:from-blue-700 hover:to-blue-800
                transition-all duration-200 shadow-lg hover:shadow-xl
              "
            >
              {t("auth.loginButton")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- Loading ---
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  // --- Error ---
  if (pageState === "error" || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
        <div className="mx-auto max-w-lg">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-red-100 text-center">
            <div className="mb-4 text-5xl">❌</div>
            <h2 className="text-2xl font-bold text-red-700 mb-3">
              {t("error.title")}
            </h2>
            <p className="text-gray-600 mb-8">
              {t("error.description")}
            </p>
            <a
              href={`/${locale}/complianceChecker`}
              className="
                inline-flex items-center gap-2 rounded-xl px-8 py-3.5
                bg-gradient-to-r from-blue-600 to-blue-700 text-white
                font-semibold text-sm
                hover:from-blue-700 hover:to-blue-800
                transition-all duration-200 shadow-lg hover:shadow-xl
              "
            >
              {t("error.newCheckButton")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- Success ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Disclaimer (top, yellow) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <h3 className="text-sm font-bold text-yellow-800 mb-2">
                {tDisclaimer("title")}
              </h3>
              <p className="text-sm text-yellow-700 leading-relaxed mb-1.5">
                {tDisclaimer("orientation")}
              </p>
              <p className="text-sm text-yellow-700 leading-relaxed">
                {tDisclaimer("legal")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main result card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-blue-100">
          {/* Classification banner */}
          <ClassificationBanner
            classification={result.classification}
            classificationKey={result.classificationKey}
            summaryKey={result.summaryKey}
            gfvoCategoryKey={result.gfvoCategoryKey}
          />

          {/* Result sections */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 space-y-4"
          >
            {/* Reasons / Legal assessment */}
            {result.reasonKeys.length > 0 && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={t("legalAssessmentTitle")}
                  itemKeys={result.reasonKeys}
                  translationNamespace="sections.complianceResult.reasons"
                  keyTransformer={reasonKeyTransformer}
                  defaultExpanded={true}
                  accentColor="#ef4444"
                />
              </motion.div>
            )}

            {/* Documents (general + sector merged) */}
            {(result.documentGeneralKeys.length > 0 ||
              result.documentSectorKeys.length > 0) && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={tLabels("sections.documents")}
                  itemKeys={[
                    ...result.documentGeneralKeys,
                    ...result.documentSectorKeys,
                  ]}
                  translationNamespace="sections.complianceResult.content"
                  keyTransformer={contentKeyTransformer}
                  accentColor="#8b5cf6"
                />
              </motion.div>
            )}

            {/* Procedural */}
            {result.proceduralKeys.length > 0 && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={tLabels("sections.procedural")}
                  itemKeys={result.proceduralKeys}
                  translationNamespace="sections.complianceResult.content"
                  keyTransformer={contentKeyTransformer}
                  accentColor="#3b82f6"
                />
              </motion.div>
            )}

            {/* Labour / occupational safety */}
            {result.labourKeys.length > 0 && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={tLabels("sections.labour")}
                  itemKeys={result.labourKeys}
                  translationNamespace="sections.complianceResult.content"
                  keyTransformer={contentKeyTransformer}
                  accentColor="#f97316"
                />
              </motion.div>
            )}

            {/* Operational duties */}
            {result.operationalDutyKeys.length > 0 && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={tLabels("sections.operationalDuties")}
                  itemKeys={result.operationalDutyKeys}
                  translationNamespace="sections.complianceResult.content"
                  keyTransformer={contentKeyTransformer}
                  accentColor="#06b6d4"
                />
              </motion.div>
            )}

            {/* Change duties */}
            {result.changeDutyKeys.length > 0 && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={tLabels("sections.changeDuties")}
                  itemKeys={result.changeDutyKeys}
                  translationNamespace="sections.complianceResult.content"
                  keyTransformer={contentKeyTransformer}
                  accentColor="#ec4899"
                />
              </motion.div>
            )}

            {/* Pre-check steps */}
            {result.preCheckKeys.length > 0 && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={tLabels("sections.preCheck")}
                  itemKeys={result.preCheckKeys}
                  translationNamespace="sections.complianceResult.content"
                  keyTransformer={contentKeyTransformer}
                  accentColor="#22c55e"
                />
              </motion.div>
            )}

            {/* Special notes */}
            {result.specialNoteKeys.length > 0 && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={tLabels("sections.specialNotes")}
                  itemKeys={result.specialNoteKeys}
                  translationNamespace="sections.complianceResult.content"
                  keyTransformer={contentKeyTransformer}
                  accentColor="#eab308"
                />
              </motion.div>
            )}

            {/* Quick references */}
            {result.quickReferenceKeys.length > 0 && (
              <motion.div variants={itemVariants}>
                <ResultSection
                  title={tLabels("sections.quickReferences")}
                  itemKeys={result.quickReferenceKeys}
                  translationNamespace="sections.complianceResult.content"
                  keyTransformer={contentKeyTransformer}
                  accentColor="#64748b"
                />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-bold text-lg">
                {t("actions.title")}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {t("actions.description")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="
                  inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold
                  bg-white/20 text-white border border-white/30
                  hover:bg-white/30 transition-all duration-200
                "
              >
                🖨️ {t("actions.print")}
              </button>
              <a
                href={`/${locale}/complianceChecker`}
                className="
                  inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold
                  bg-white text-blue-700
                  hover:bg-blue-50 transition-all duration-200
                  shadow-md hover:shadow-lg
                "
              >
                {t("actions.newCheck")}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
