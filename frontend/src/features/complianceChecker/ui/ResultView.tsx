"use client";

import { useTranslations } from "next-intl";
import type { components } from "@/lib/api/checker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/typography/Heading";
import { Text } from "@/components/typography/Text";
import ComplianceResultCards from "./ResultStackedCards";
import BreakPoint from "@/components/common/BreakPoint";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

type CheckerResult = components["schemas"]["CheckerResult"];

type Props = {
  result: CheckerResult;
  onRestart: () => void;
  restartDisabled?: boolean;
};

export default function ResultView({
  result,
  onRestart,
  restartDisabled,
}: Props) {
  const cls = useTranslations("sections.complianceResult.classifications");
  const disclaimerT = useTranslations("sections.complianceResult.disclaimer");
  const actions = useTranslations("common.actions");
  const contentT = useTranslations("sections.complianceResult.content");


  const classification = result.classification;

  return (
    <Section>
      <Container>
        {/* Header: Titel + Neustart-Button */}
        <div className="mb-8 flex items-center justify-between">
          <Heading as="h1" className="mt-0">
            {actions("check.result")}
          </Heading>
          <Button
            type="button"
            variant="secondary"
            disabled={restartDisabled}
            onClick={onRestart}
          >
            {actions("check.restart")}
          </Button>
        </div>

        {/* Rechtlicher Hinweis direkt unter dem Titel */}
        <Card variant="orientation" gap="sm" className="mb-8 p-4 hover:translate-y-0">
          <Heading as="h3" className="mt-0">
            {disclaimerT("title")}
          </Heading>
          <Text size="sm" tone="muted" className="mt-0">
            {disclaimerT("orientation")}
          </Text>
          <Text size="sm" tone="muted" className="mt-0">
            {disclaimerT("legal")}
          </Text>
        </Card>

        {/* Ergebnisse */}
        <Card gap="md" variant="borderless">
          <div className="space-y-6">

            <Heading as="h2" className="mt-0">
              {cls(`${classification}.title`)}
            </Heading>
            <Text className="mt-3" size="base" tone="default">
              {cls(`${classification}.summary`)}
            </Text>

          </div>
          <BreakPoint />

          <ComplianceResultCards result={result} />

          {result.rulesVersion ? (
            <Text size="sm" tone="muted" className="mt-4 text-right">
              {contentT("rulesVersion", { version: result.rulesVersion })}
            </Text>
          ) : null}
        </Card >

      </Container>
    </Section>
  );
}