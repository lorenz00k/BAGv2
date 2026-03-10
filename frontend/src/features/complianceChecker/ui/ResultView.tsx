"use client";

import { useTranslations } from "next-intl";
import type { components } from "@/lib/api/checker";

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
      <h1 className="text-2xl font-semibold">
        {cls(`${classification}.title`)}
      </h1>

      <p className="mt-3 text-sm opacity-80">
        {cls(`${classification}.summary`)}
      </p>

      {reasons.length > 0 ? (
        <div className="mt-8 rounded-2xl border p-5">
          <h2 className="text-lg font-semibold">{reasonsT("title")}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            {reasons.map((r) => (
              <li key={r}>
                {reasonsT(`items.${r}`)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.gfvoCategory ? (
        <div className="mt-6 rounded-2xl border p-5 text-sm">
          <div className="font-medium">{gfvoT("match.title")}</div>
          <div className="mt-2 opacity-80">
            {gfvoT(`categories.${result.gfvoCategory}`)}
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border p-5 text-sm opacity-80">
        <div className="font-medium">{disclaimerT("title")}</div>
        <div className="mt-2">{disclaimerT("orientation")}</div>
      </div>

      <button
        type="button"
        disabled={restartDisabled}
        onClick={onRestart}
        className="mt-8 rounded-lg border px-4 py-2 text-sm"
      >
        {actions("check.restart")}
      </button>
    </div>
  );
}