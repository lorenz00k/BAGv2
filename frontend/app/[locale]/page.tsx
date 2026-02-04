//Main page

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/locales";

export default function Home({ params }: { params: { locale: Locale } }) {
    const t = useTranslations("home");
    const { locale } = params;

    const items = [
        { href: `/${locale}/compliance-checker`, title: t("complianceTitle"), desc: t("complianceDesc") },
        { href: `/${locale}/gastro-ai`, title: t("gastroTitle"), desc: t("gastroDesc") },
        { href: `/${locale}/address-checker`, title: t("addressTitle"), desc: t("addressDesc") },
    ];

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            Hello
        </main>
    );
}
