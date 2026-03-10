"use client";

import { useTranslations } from "next-intl";
import type { components } from "@/lib/api/checker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/typography/Heading";
import { Text } from "@/components/typography/Text";

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
  const reasonsT = useTranslations("sections.complianceResult.reasons");
  const gfvoT = useTranslations("sections.complianceResult.gfvo");
  const disclaimerT = useTranslations("sections.complianceResult.disclaimer");
  const actions = useTranslations("common.actions");

  const classification = result.classification;
  const reasons = result.reasons ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-6">
        <Card className="hover:translate-y-0">
          <Heading as="h1" className="mt-0">
            {cls(`${classification}.title`)}
          </Heading>

          <Text className="mt-3" size="base" tone="default">
            {cls(`${classification}.summary`)}
          </Text>
        </Card>

        {reasons.length > 0 ? (
          <Card variant="subtle" className="p-5 hover:translate-y-0">
            <Heading as="h2" className="mt-0">
              {reasonsT("title")}
            </Heading>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              {reasons.map((r) => (
                <li key={r}>
                  <Text size="sm" tone="muted" className="mt-0">
                    {reasonsT(`items.${r}`)}
                  </Text>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {result.gfvoCategory ? (
          <Card variant="subtle" className="p-5 hover:translate-y-0">
            <Heading as="h2" className="mt-0">
              {gfvoT("match.title")}
            </Heading>

            <Text size="sm" tone="muted">
              {gfvoT(`categories.${result.gfvoCategory}`)}
            </Text>
          </Card>
        ) : null}

        <Card variant="subtle" className="p-5 hover:translate-y-0">
          <Heading as="h2" className="mt-0">
            {disclaimerT("title")}
          </Heading>

          <Text size="sm" tone="muted">
            {disclaimerT("orientation")}
          </Text>
        </Card>

        <div>
          <Button
            type="button"
            variant="secondary"
            disabled={restartDisabled}
            onClick={onRestart}
          >
            {actions("check.restart")}
          </Button>
        </div>
      </div>
    </div>
  );
}