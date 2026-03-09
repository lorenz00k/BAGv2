// server component weil statische seite 
import { getTranslations } from "next-intl/server"

import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { Card } from "@/components/ui/Card"
import BreakPoint from "@/components/common/BreakPoint"
import SectionHeading from "@/components/layout/SectionHeading/SectionHeading"
import { Heading } from "@/components/typography/Heading"
import { Text } from "@/components/typography/Text"

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

export default async function ImprintPage() {
    const t = await getTranslations("legal.imprint")

    const copy = {
        title: t("title"),
        sections: t.raw("sections"),
    } as ImprintCopy

    const sections = Array.isArray(copy.sections) ? copy.sections : []

    return (

        <Section>
            <Container>
                {/* Außenabstand + max width */}
                <Card variant="borderless">
                    <div className="p-6 sm:p-10">
                        {/* eher “legal” => links ausrichten */}
                        <SectionHeading title={copy.title} subtitle="Angaben gemäß gesetzlichen Informationspflichten.">
                        </SectionHeading>

                        <BreakPoint />

                        {sections.map((s, idx) => (
                            <div key={idx}>
                                <Heading as="h4">{s.heading}</Heading>

                                {Array.isArray(s.lines) &&
                                    s.lines.map((line, i) => <Text key={i}>{line}</Text>)}

                                {s.email && s.emailLabel ? (
                                    <Text>
                                        {s.emailLabel}:{" "}
                                        <a
                                            href={`mailto:${s.email}`}
                                            className="underline underline-offset-4 hover:text-slate-900"
                                        >
                                            {s.email}
                                        </a>
                                    </Text>
                                ) : null}

                                {Array.isArray(s.paragraphs) &&
                                    s.paragraphs.map((p, i) => <Text key={i}>{p}</Text>)}

                                {s.note ? <p className="mt-2 text-sm italic text-slate-500">{s.note}</p> : null}

                                {/* Spacer zwischen Abschnitten */}
                                {idx < sections.length - 1 ? <BreakPoint size="lg" /> : null}
                            </div>
                        ))}
                    </div>
                </Card>
            </Container>
        </Section>

    )
}
