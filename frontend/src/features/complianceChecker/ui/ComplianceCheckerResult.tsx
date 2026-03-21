"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { useComplianceChecker } from "../hooks/useComplianceChecker";
import ResultView from "./ResultView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/typography/Text";
import { Locale } from "@/i18n/locales";
import { href } from "@/navigation/nav";

export default function ComplianceCheckerResult() {
  const router = useRouter();
  const locale = useLocale();
  const actions = useTranslations("common.actions");
  const statusT = useTranslations("common.labels.status");

  const [isRestarting, setIsRestarting] = useState(false);
  const hasTriedRefresh = useRef(false);

  const { status, state, error, refresh, restart, savedResult } = useComplianceChecker();

  // result: either from active session or from saved check in db
  const result = state?.result ?? savedResult;

  useEffect(() => {
    if (isRestarting) return;
    if (status !== "ready") return;

    //show saved result
    if (result) return;

    if (!state) return;

    if (state.status !== "finished") {
      router.replace(href(locale as Locale, "complianceChecker"));
      return;
    }

    if (!state.result && !hasTriedRefresh.current) {
      hasTriedRefresh.current = true;
      void refresh();
      return;
    }

    if (!state.result && hasTriedRefresh.current) {
      router.replace(href(locale as Locale, "complianceChecker"));
    }
  }, [isRestarting, status, state, result, refresh, router]);

  async function handleRestart() {
    setIsRestarting(true);

    try {
      await restart();
      router.replace(href(locale as Locale, "complianceChecker"));
    } finally {
      setIsRestarting(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card
          variant="subtle"
          className="gap-2 border-red-300 bg-red-50 p-4 hover:translate-y-0"
        >
          <Text size="sm" className="mt-0 text-red-800">
            {error}
          </Text>
        </Card>

        <div className="mt-6">
          <Button type="button" variant="previous" onClick={() => router.back()}>
            {actions("navigation.back")}
          </Button>
        </div>
      </div>
    );
  }

  if (!result || status === "loading" || status === "evaluating" || isRestarting) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card variant="subtle" className="p-4 hover:translate-y-0">
          <Text size="sm" tone="muted" className="mt-0">
            {statusT("loading")}
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <ResultView
      result={result}
      onRestart={handleRestart}
      restartDisabled={isRestarting}
    />
  );
}