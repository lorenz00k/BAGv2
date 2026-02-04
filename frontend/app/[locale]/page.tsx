//Main page

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/locales";
import { getTranslations } from "next-intl/server";

type PageProps = {
    params: Promise<{ locale: Locale }>;
};

export default async function Home({
    params
}: PageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.home" });


    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <h2>{t('hero.title')}</h2>

        </main>
    );
}
