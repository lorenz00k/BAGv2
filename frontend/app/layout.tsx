// app/[locale]/layout.tsx
import HeaderNav from "@/components/common/navigation/Header/HeaderNav";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { Locale } from "@/i18n/locales";
import Footer from "@/components/common/Footer/Footer";

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: Locale };
}) {
    // next-intl holt die messages über eure request-config
    const messages = await getMessages();
    const { locale } = params;

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider messages={messages}>
                    <HeaderNav locale={locale} />
                    {children}

                    <Footer locale={locale} />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
