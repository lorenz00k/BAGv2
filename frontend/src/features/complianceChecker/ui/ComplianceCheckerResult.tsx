"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useComplianceChecker } from "../hooks/useComplianceChecker";
import ResultView from "./ResultView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/typography/Text";

export default function ComplianceCheckerResult() {
  const router = useRouter();
  const actions = useTranslations("common.actions");
  const statusT = useTranslations("common.labels.status");

  const [isRestarting, setIsRestarting] = useState(false);
  const hasTriedRefresh = useRef(false);

  const { status, state, error, refresh, restart } = useComplianceChecker();

  useEffect(() => {
    if (isRestarting) return;
    if (status !== "ready") return;
    if (!state) return;

    if (state.status !== "finished") {
      router.replace("/complianceChecker");
      return;
    }

    if (!state.result && !hasTriedRefresh.current) {
      hasTriedRefresh.current = true;
      void refresh();
      return;
    }

    if (!state.result && hasTriedRefresh.current) {
      router.replace("/complianceChecker");
    }
  }, [isRestarting, status, state, refresh, router]);

  async function handleRestart() {
    setIsRestarting(true);

    try {
      await restart();
      router.replace("/complianceChecker");
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

  if (!state || status === "loading" || status === "evaluating" || isRestarting) {
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

  if (!state.result) {
    return null;
  }

  return (
    <ResultView
      result={state.result}
      onRestart={handleRestart}
      restartDisabled={isRestarting}
    />
  );
}