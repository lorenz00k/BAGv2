"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { components } from "@/lib/api/checker";
import { Text } from "@/components/typography/Text";
import StackedCards from "@/components/ui/StackedCards/StackedCards";

type CheckerResult = components["schemas"]["CheckerResult"];

type Props = {
    result: CheckerResult;
};

export default function ComplianceResultCards({ result }: Props) {
    const gfvoT = useTranslations("sections.complianceResult.gfvo");
    const contentT = useTranslations("sections.complianceResult.content");
    const reasonsT = useTranslations("sections.complianceResult.reasons");

    const reasons = result.reasons ?? [];
    const nextSteps = result.nextSteps ?? [];
    const documentHints = result.documentHints ?? [];

    const items = [
        reasons.length > 0 ? {
            title: reasonsT("title"),
            bodyNode: (
                <ul className="list-disc space-y-2 pl-5">
                    {reasons.map((r) => (
                        <li key={r}>
                            <Text size="sm" tone="muted" className="mt-0">
                                {reasonsT(`items.${r}`)}
                            </Text>
                        </li>
                    ))}
                </ul>
            ),
        } : null,


        result.gfvoCategory ? {
            title: gfvoT("match.title"),
            body: gfvoT(`categories.${result.gfvoCategory}`),
        } : null,

        nextSteps.length > 0 && nextSteps[0] !== "noActionRequired" ? {
            title: contentT("nextSteps.title"),
            bodyNode: (
                <ul className="list-disc space-y-2 pl-5">
                    {nextSteps.map((s) => (
                        <li key={s}>
                            <Text size="sm" tone="muted" className="mt-0">
                                {contentT(`nextSteps.items.${s}`)}
                            </Text>
                        </li>
                    ))}
                </ul>
            ),
        } : null,

        documentHints.length > 0 ? {
            title: contentT("documents.title"),
            bodyNode: (
                <ul className="list-disc space-y-2 pl-5">
                    {documentHints.map((d) => (
                        <li key={d}>
                            <Text size="sm" tone="muted" className="mt-0">
                                {contentT(`documents.items.${d}`)}
                            </Text>
                        </li>
                    ))}
                </ul>
            ),
        } : null,

        result.authorityHint && result.authorityHint !== "none" ? {
            title: contentT("authority.title"),
            body: contentT(`authority.hints.${result.authorityHint}`),
        } : null,
    ].filter(Boolean) as React.ComponentProps<typeof StackedCards>["items"];

    if (items.length === 0) return null;

    return <StackedCards items={items} headingLevel={2} />;
}