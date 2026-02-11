import { getTranslations } from "next-intl/server"

import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import SectionHeading from "@/components/layout/SectionHeading/SectionHeading"
import { Card } from "@/components/ui/Card"
import BreakPoint from "@/components/common/BreakPoint"
import { Heading } from "@/components/typography/Heading"
import { Text } from "@/components/typography/Text"

type PrivacyCopy = {
    title: string
    controller: {
        heading: string
        name: string
        address: string
        emailLabel: string
        email: string
        dpo: string
    }
    sections: Array<{
        heading: string
        intro?: string
        paragraphs?: string[]
        bullets?: string[]
        subsections?: Array<{ heading: string; bullets: string[] }>
        authority?: { name: string; address: string; url: string }
        versionLabel?: string
        version?: string
    }>
}

export default async function PrivacyPage() {
    const t = await getTranslations("legal.privacy")

    const copy = {
        title: t("title"),
        controller: t.raw("controller"),
        sections: t.raw("sections"),
    } as PrivacyCopy

    const sections = Array.isArray(copy.sections) ? copy.sections : []

    return (

        <Section>
            <Container>
                <Card variant="borderless">
                    {/* Innenabstand */}
                    <div className="p-6 sm:p-10">
                        <SectionHeading title={copy.title} as="h2" />

                        <BreakPoint />

                        <Heading as="h4">{copy.controller.heading}</Heading>
                        <Text>{copy.controller.name}</Text>
                        <Text>{copy.controller.address}</Text>
                        <Text>
                            {copy.controller.emailLabel}:{" "}
                            <a
                                className="underline underline-offset-4 hover:text-slate-900"
                                href={`mailto:${copy.controller.email}`}
                            >
                                {copy.controller.email}
                            </a>
                        </Text>
                        <Text>{copy.controller.dpo}</Text>

                        {sections.map((s, idx) => (
                            <div key={idx}>
                                <BreakPoint />

                                <Heading as="h4">{s.heading}</Heading>
                                {s.intro ? <Text>{s.intro}</Text> : null}


                                {Array.isArray(s.paragraphs) && s.paragraphs.map((p, i) => <Text key={i}>{p}</Text>)}
                                {Array.isArray(s.bullets) && s.bullets.length > 0 ? (

                                    <ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-7 text-slate-700">

                                        {s.bullets.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                ) : null}

                                {Array.isArray(s.subsections) &&
                                    s.subsections.map((sub, j) => (
                                        <div key={j}>
                                            <BreakPoint />
                                            <Heading as="h5">{sub.heading}</Heading>
                                            <ul className="mt-3 list-disc space-y-2 pl-6 text-[15px] leading-7 text-slate-700">
                                                {sub.bullets.map((b, k) => (
                                                    <li key={k}>{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}

                                {s.authority ? (
                                    <div className="mt-4 text-[15px] leading-7 text-slate-700">
                                        <div className="font-medium text-slate-900">{s.authority.name}</div>
                                        <div>{s.authority.address}</div>
                                        <a
                                            href={s.authority.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline underline-offset-4 hover:text-slate-900"
                                        >
                                            {s.authority.url}
                                        </a>
                                    </div>
                                ) : null}

                                {s.version ? (
                                    <p className="mt-6 text-sm text-slate-500">
                                        {(s.versionLabel ?? "Version")}: {s.version}
                                    </p>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </Card>
            </Container>
        </Section>

    )
}
