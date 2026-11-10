import { isLocale } from "@/i18n/locales";
import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RegisterForm from "@/features/auth/RegisterForm";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();
    const t = await getTranslations({ locale, namespace: "pages.auth.register" });
    return { title: t("title") };
}

export default async function RegisterPage({ params }: PageProps) {
    await params;
    return <RegisterForm />;
}
