//Startseite
import { isLocale } from "@/i18n/locales";
import { notFound } from 'next/navigation';
import HomePage from "@/features/home/HomePage";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export default async function Home({
    params
}: PageProps) {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();

    return (
        <HomePage locale={locale} />
    );
}
