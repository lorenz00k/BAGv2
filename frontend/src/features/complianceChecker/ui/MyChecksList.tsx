"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/typography/Heading";
import { Text } from "@/components/typography/Text";
import type { SavedCheck } from "../api/checkerApi";

type Props = {
  checks: SavedCheck[];
  busy?: boolean;
  onOpenResult: (id: string) => void;
  onResume: (check: SavedCheck) => void;
  onNew: () => void;
};

export default function MyChecksList({
  checks,
  busy,
  onOpenResult,
  onResume,
  onNew,
}: Props) {
  const form = useTranslations("sections.complianceChecker.form");
  const cls = useTranslations("sections.complianceResult.classifications");
  const actions = useTranslations("common.actions");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Heading as="h2" className="mt-0">
        {form("checkList.title")}
      </Heading>
      <Text size="base" tone="muted" className="mt-2">
        {form("checkList.description")}
      </Text>

      <ul className="mt-6 flex flex-col gap-3">
        {checks.map((check) => {
          const completed = check.status === "completed" && check.result;
          return (
            <li key={check.id}>
              <Card
                variant="subtle"
                className="flex items-center justify-between gap-4 p-5 hover:translate-y-0"
              >
                <div>
                  <Text size="base" className="mt-0 font-medium">
                    {completed
                      ? cls(`${check.result!.classification}.title`)
                      : form("checkList.draft")}
                  </Text>
                  <Text size="sm" tone="muted" className="mt-1">
                    {form("checkList.date", {
                      date: new Date(check.updatedAt).toLocaleDateString("de-AT"),
                    })}
                  </Text>
                </div>

                {completed ? (
                  <Button variant="next" onClick={() => onOpenResult(check.id)}>
                    {actions("check.viewResult")}
                  </Button>
                ) : (
                  <Button variant="secondary" disabled={busy} onClick={() => onResume(check)}>
                    {actions("check.resume")}
                  </Button>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        <Button variant="next" disabled={busy} onClick={onNew}>
          {actions("check.new")}
        </Button>
      </div>
    </div>
  );
}