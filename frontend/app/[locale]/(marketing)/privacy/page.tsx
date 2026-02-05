import { getTranslations } from "next-intl/server"

import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { SectionHeading } from "@/components/layout/SectionHeading"
import { Card } from "@/components/ui/Card"
import BreakPoint from "@/components/common/BreakPoint"

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

function P({ children }: { children: React.ReactNode }) {
    return <p className="mt-3 text-[15px] leading-7 text-slate-700">{children}</p>
}
function H2({ children }: { children: React.ReactNode }) {
    return <h2 className="mt-10 text-2xl font-semibold text-slate-900">{children}</h2>
}
function H3({ children }: { children: React.ReactNode }) {
    return <h3 className="mt-6 text-lg font-semibold text-slate-900">{children}</h3>
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
        <Container>
            <Section>
                {/* Außenabstand + max width */}
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                    <Card>
                        {/* Innenabstand */}
                        <div className="p-6 sm:p-10">
                            <SectionHeading title={copy.title} />

                            <BreakPoint />

                            <H2>{copy.controller.heading}</H2>
                            <P>{copy.controller.name}</P>
                            <P>{copy.controller.address}</P>
                            <P>
                                {copy.controller.emailLabel}:{" "}
                                <a
                                    className="underline underline-offset-4 hover:text-slate-900"
                                    href={`mailto:${copy.controller.email}`}
                                >
                                    {copy.controller.email}
                                </a>
                            </P>
                            <P>{copy.controller.dpo}</P>

                            {sections.map((s, idx) => (
                                <div key={idx}>
                                    <BreakPoint />

                                    <H2>{s.heading}</H2>
                                    {s.intro ? <P>{s.intro}</P> : null}


                                    {Array.isArray(s.paragraphs) && s.paragraphs.map((p, i) => <P key={i}>{p}</P>)}
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
                                                <H3>{sub.heading}</H3>
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
                </div>
            </Section>
        </Container>
    )
}
