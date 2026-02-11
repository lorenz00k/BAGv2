import FAQPageClient from "@/features/faq/FAQPageClient";
import { Locale, locales } from "@/i18n/locales";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(
    { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
    const { locale } = await params;

    // optional: hier kannst du später aus pages/faq.json title/desc ziehen
    return {
        title: "FAQ",
        alternates: { canonical: `/${locale}/faq` },
    };
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    if (!locales.includes(locale as Locale)) notFound();

    const groups = [
        { id: "approval", questions: ["q1", "q2", "q4"] },
        { id: "costs", questions: ["q3", "q5"] },
        { id: "legal", questions: ["q6", "q7", "q8", "q9", "q10"] },
    ] as const;

    return <FAQPageClient locale={locale} groups={groups} />;
}
