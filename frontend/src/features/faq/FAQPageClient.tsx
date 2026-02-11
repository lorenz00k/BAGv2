"use client"

import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import Link from "next/link"
import { Locale } from "@/i18n/locales"
import { Section } from "@/components/layout/Section"
import { Container } from "@/components/layout/Container"
import SectionHeading from "@/components/layout/SectionHeading/SectionHeading"
import StackedCards from "@/components/ui/StackedCards/StackedCards"
import FAQAccordion, { FAQItem } from "./FAQAccordion"
import CtaPanel from "@/components/ui/CtaPanels/CtaPanel"
import BreakPoint from "@/components/common/BreakPoint"

type Group = { id: string; questions: readonly string[] };

type FAQPageClientProps = {
    locale: string;
    groups: readonly Group[];
};

export default function FAQPageClient({ locale, groups }: FAQPageClientProps) {
    const tPage = useTranslations("pages.faq");
    const tGroups = useTranslations("sections.faq.groups");
    const tQuestions = useTranslations("sections.faq.questions");
    const tCta = useTranslations("sections.faq.cta");

    const [openId, setOpenId] = useState<string | null>(null);
    const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

    const uiGroups = useMemo(
        () =>
            groups.map((g) => ({
                ...g,
                title: tGroups(`${g.id}.title`),
                description: tGroups(`${g.id}.description`),
                items: g.questions.map(
                    (q): FAQItem => ({
                        id: q,
                        question: tQuestions(`${q}.question`),
                        answer: tQuestions(`${q}.answer`),
                    })
                ),
            })),
        [groups, tGroups, tQuestions]
    );

    const allQuestions = useMemo(() => groups.flatMap((g) => [...g.questions]), [groups]);

    const faqSchema = useMemo(
        () => ({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: allQuestions.map((q) => ({
                "@type": "Question",
                name: tQuestions(`${q}.question`),
                acceptedAnswer: { "@type": "Answer", text: tQuestions(`${q}.answer`) },
            })),
        }),
        [allQuestions, tQuestions]
    );

    const faqSchemaJson = JSON.stringify(faqSchema)
        .replace(/</g, "\\u003C")
        .replace(/>/g, "\\u003E")
        .replace(/&/g, "\\u0026");

    return (
        <>
            <script
                type="application/ld+json"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: faqSchemaJson }}
            />
            <Section>
                <Container>
                    <SectionHeading id="faq-title"
                        title={tPage("title")}
                        subtitle={tPage("subtitle")}
                        as="h1"
                        subtitleAs="p" />
                    <BreakPoint />
                    <StackedCards
                        headingLevel={2}
                        items={uiGroups.map((g) => ({
                            title: g.title,
                            bodyNode: (
                                <>
                                    <p style={{ margin: "0.75rem 0 0", opacity: 0.85 }}>
                                        {g.description}
                                    </p>
                                    <FAQAccordion items={g.items} openId={openId} onToggle={toggle} />
                                </>
                            ),
                        }))}
                    />

                    <CtaPanel
                        title={tCta("title")}
                        text={tCta("description")}
                        href={`/${locale}/check`}
                        buttonLabel={tCta("button")}
                    />
                </Container>
            </Section>
        </>
    )
}
