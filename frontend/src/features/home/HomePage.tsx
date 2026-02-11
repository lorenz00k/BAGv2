"use client"

import Hero from "./components/Hero"
import SellingPoints from "./components/SellingPoints"
import DocumentTeaser from "./components/DocumentTeaser"
import { SectionSeparator } from "@/components/layout/SectionSeperator"
import FounderGuide from "./components/FounderGuide"
import CtaPanel from "@/components/ui/CtaPanels/CtaPanel"
import { useTranslations } from "next-intl"
import { href } from "@/navigation/nav"
import { Locale } from "@/i18n/locales"
import { Container } from "@/components/layout/Container"


export default function HomePage({ locale }: { locale: string }) {
    const t = useTranslations("sections.founderGuide");
    const b = useTranslations("common.actions")
    return (
        <>
            <Hero locale={locale} />

            <SellingPoints />
            <SectionSeparator />

            <DocumentTeaser locale={locale} />
            <SectionSeparator />

            <FounderGuide />
            <SectionSeparator />

            <Container>
                <CtaPanel
                    title={t("cta.title")}
                    text={t("cta.text")}
                    href={href(locale as Locale, "complianceChecker")}
                    buttonLabel={b("check.start")}
                />
            </Container>
        </>
    )
}
