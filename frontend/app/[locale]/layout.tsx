// app/[locale]/layout.tsx
import HeaderNav from "@/components/common/navigation/Header/HeaderNav";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from 'next/navigation';
import { getMessages } from "next-intl/server";
import type { Locale } from "@/i18n/locales";
import { locales } from "@/i18n/locales";
import { AuthProvider } from "@/context/AuthContext";

import Footer from "@/components/common/Footer/Footer";
import type { Metadata } from "next"
import CookieConsentMount from "@/components/common/cookie/CookieConsentMount";
import { EmailVerificationBanner } from "@/features/auth/components/EmailVerificationBanner";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    if (!locales.includes(locale)) notFound()

    return {
        manifest: `/${locale}/manifest.webmanifest`,
    }
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: Locale }>;
}) {

    const { locale } = await params;
    if (!locales.includes(locale)) notFound();

    const messages = await getMessages();


    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <CookieConsentMount locale={locale} />

            <AuthProvider>
                <HeaderNav locale={locale} />
                <EmailVerificationBanner />
                {children}
                <Footer locale={locale} />
            </AuthProvider>

        </NextIntlClientProvider>
    );
}