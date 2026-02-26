import FoerderCheck from "@/features/grantchecker/FoerderCheck";
import { Locale, locales } from "@/i18n/locales";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(
    { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
    const { locale } = await params;

    return {
        title: "Förder-Check: Lebendiges Grätzl | Wien",
        description: "Prüfen Sie in wenigen Schritten, ob Ihr Projekt für die Nahversorger-Förderung 'Lebendiges Grätzl' der Wirtschaftsagentur Wien in Frage kommt.",
        alternates: { canonical: `/${locale}/foerder-check` },
    };
}

export default async function FoerderCheckPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    
    // Validierung der Sprache, ansonsten 404
    if (!locales.includes(locale as Locale)) notFound();

    return (
        // Ein Wrapper mit etwas Padding und einer dezenten Hintergrundfarbe, 
        // damit die Card aus dem FoerderCheck gut zur Geltung kommt
        <main className="min-h-screen bg-gray-50 py-12 md:py-24">
            <FoerderCheck />
        </main>
    );
}