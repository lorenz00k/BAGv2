//Startseite

import type { Locale } from "@/i18n/locales";
import HomePage from "@/features/home/HomePage";

type PageProps = {
    params: Promise<{ locale: Locale }>;
};

export default async function Home({
    params
}: PageProps) {
    const { locale } = await params;

    return (
        <HomePage locale={locale} />
    );
}
