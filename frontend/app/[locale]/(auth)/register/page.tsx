import type { Locale } from "@/i18n/locales";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RegisterForm from "@/tools/auth/RegisterForm";

type PageProps = {
    params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.auth.register" });
    return { title: t("title") };
}

export default async function RegisterPage({ params }: PageProps) {
    await params;
    return <RegisterForm />;
}
