// app/[locale]/layout.tsx
import HeaderNav from "@/components/common/navigation/Header/HeaderNav";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from 'next/navigation';
import { getMessages } from "next-intl/server";
import type { Locale } from "@/i18n/locales";
import { locales } from "@/i18n/locales";
import { ROUTES } from "@/navigation/routes"

import Footer from "@/components/common/Footer/Footer";
import "@/styles/globals.css";

export default async function RootLayout({
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
        <html lang={locale}>
            <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <HeaderNav locale={locale} />

                    {children}
                    {/* <Footer locale={locale} />*/}

                </NextIntlClientProvider>
            </body>
        </html>
    );
}
