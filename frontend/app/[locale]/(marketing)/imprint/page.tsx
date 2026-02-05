// server component weil statische seite 
import { getTranslations } from "next-intl/server"

import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { SectionHeading, SectionTitle, SectionCopy } from "@/components/layout/SectionHeading"
import { Card } from "@/components/ui/Card"
import BreakPoint from "@/components/common/BreakPoint"

type ImprintCopy = {
    title: string
    sections: Array<{
        heading: string
        lines?: string[]
        paragraphs?: string[]
        note?: string
        emailLabel?: string
        email?: string
    }>
}

function H2({ children }: { children: React.ReactNode }) {
    return <h2 className="text-xl font-semibold text-slate-900 mt-10">{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
    return <p className="mt-3 text-[15px] leading-7 text-slate-700">{children}</p>
}

export default async function ImprintPage() {
    const t = await getTranslations("legal.imprint")

    const copy = {
        title: t("title"),
        sections: t.raw("sections"),
    } as ImprintCopy

    const sections = Array.isArray(copy.sections) ? copy.sections : []

    return (
        <Container>
            <Section>
                {/* Außenabstand + max width */}
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                    <Card>
                        <div className="p-6 sm:p-10">
                            {/* eher “legal” => links ausrichten */}
                            <SectionHeading className="text-left mx-0 max-w-none">
                                <SectionTitle className="text-left mx-0">{copy.title}</SectionTitle>
                                <SectionCopy className="text-left mx-0 max-w-[75ch]">
                                    Angaben gemäß gesetzlichen Informationspflichten.
                                </SectionCopy>
                            </SectionHeading>

                            <BreakPoint />

                            {sections.map((s, idx) => (
                                <div key={idx}>
                                    <H2>{s.heading}</H2>

                                    {Array.isArray(s.lines) &&
                                        s.lines.map((line, i) => <P key={i}>{line}</P>)}

                                    {s.email && s.emailLabel ? (
                                        <P>
                                            {s.emailLabel}:{" "}
                                            <a
                                                href={`mailto:${s.email}`}
                                                className="underline underline-offset-4 hover:text-slate-900"
                                            >
                                                {s.email}
                                            </a>
                                        </P>
                                    ) : null}

                                    {Array.isArray(s.paragraphs) &&
                                        s.paragraphs.map((p, i) => <P key={i}>{p}</P>)}

                                    {s.note ? <p className="mt-2 text-sm italic text-slate-500">{s.note}</p> : null}

                                    {/* Spacer zwischen Abschnitten */}
                                    {idx < sections.length - 1 ? <BreakPoint size="lg" /> : null}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </Section>
        </Container>
    )
}
