import { isLocale } from "@/i18n/locales";
import { notFound } from 'next/navigation';
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/features/auth/LoginForm"

type PageProps = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();
    const t = await getTranslations({ locale, namespace: "pages.auth.login" });
    return { title: t("title") };
}

export default async function LoginPage({ params }: PageProps) {
    await params;
    return <LoginForm />;
}