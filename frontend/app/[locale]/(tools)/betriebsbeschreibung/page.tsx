import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Locale, locales } from "@/i18n/locales"
import { WizardClient } from "@/features/documents/wizard/WizardClient"

export async function generateMetadata(
    { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
    const { locale } = await params
    return {
        title: "Betriebsbeschreibung erstellen",
        description:
            "Schritt-für-Schritt-Assistent für die Betriebsbeschreibung gemäß §353 GewO – " +
            "Formular 005-2 der MA 36 Wien. Kostenlos, im Browser, PDF-Download.",
        alternates: { canonical: `/${locale}/betriebsbeschreibung` },
    }
}

export default async function BetriebsbeschreibungPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    if (!locales.includes(locale as Locale)) notFound()

    return <WizardClient />
}
