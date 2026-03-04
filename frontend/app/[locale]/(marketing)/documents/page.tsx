import DokumentePageClient from "@/features/documents/DokumentePageClient";
import { Locale, locales } from "@/i18n/locales";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(
    { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
    const { locale } = await params;

    return {
        title: "Dokumente",
        description: "Alle relevanten Dokumente im Überblick.",
        alternates: { canonical: `/${locale}/documents` },
    };
}

export default async function DokumentePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!locales.includes(locale as Locale)) notFound();

    return <DokumentePageClient locale={locale} />;
}
