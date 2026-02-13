import type { Locale } from "@/i18n/locales";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/tools/auth/LoginForm"

type PageProps = {
    params: Promise<{locale: Locale}>;
};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
    const {locale} = await params;
    const t = await getTranslations({locale, namespace: "pages.auth.login"});
    return {title: t("title")};
}

export default async function LoginPage({params}: PageProps) {
    await params;
    return <LoginForm />;
}