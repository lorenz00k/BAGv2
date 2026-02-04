// getRequestConfig wrapper

import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, type Locale } from "./locales";
import { loadAllMessages } from "./bundles";

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale: Locale = isLocale(requested) ? requested : defaultLocale;

    try {
        const messages = await loadAllMessages(locale);
        return { locale, messages };
    } catch {
        const messages = await loadAllMessages(defaultLocale);
        return { locale: defaultLocale, messages };
    }
});