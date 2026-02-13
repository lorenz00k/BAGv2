// src/i18n/bundles.ts
// show which message bundles exist (nested namespaces)

import type { AbstractIntlMessages } from "next-intl";
import type { Locale } from "./locales";

type Loader = (l: Locale) => Promise<AbstractIntlMessages>;

/**
 * We return a top-level object like:
 * {
 *   common: { actions, labels, items, navigation },
 *   pages: { home, faq, ... },
 *   components: { featureCards, footer, stats },
 *   sections: { ... },
 *   seo: { routes }
 * }
 *
 * So you can use:
 * useTranslations("common.items")
 * useTranslations("common.navigation")
 * useTranslations("pages.home")
 * ...
 */
export const messageBundles: Record<string, Loader> = {
    common: async (l) =>
        ({
            actions: (await import(`@/messages/${l}/common/actions.json`)).default,
            labels: (await import(`@/messages/${l}/common/labels.json`)).default,

            items: (await import(`@/messages/${l}/common/items.json`)).default,

            // navigation ui strings
            navigation: (await import(`@/messages/${l}/common/navigation.json`)).default,
        }) as AbstractIntlMessages,

    pages: async (l) =>
        ({
            home: (await import(`@/messages/${l}/pages/home.json`)).default,
            faq: (await import(`@/messages/${l}/pages/faq.json`)).default,

            // keep the filenames you actually have under src/messages/{locale}/pages/*
            addressChecker: (await import(`@/messages/${l}/pages/addressChecker.json`)).default,
            complianceChecker: (await import(`@/messages/${l}/pages/complianceChecker.json`)).default,
            complianceResult: (await import(`@/messages/${l}/pages/complianceResult.json`)).default,
            auth: (await import(`@/messages/${l}/pages/auth.json`)).default,
        }) as AbstractIntlMessages,

    components: async (l) =>
        ({
            featureCards: (await import(`@/messages/${l}/components/featureCards.json`)).default,
            footer: (await import(`@/messages/${l}/components/footer.json`)).default,
            stats: (await import(`@/messages/${l}/components/stats.json`)).default,
        }) as AbstractIntlMessages,

    sections: async (l) =>
        ({
            approvalFlow: (await import(`@/messages/${l}/sections/approvalFlow.json`)).default,
            approvalSeo: (await import(`@/messages/${l}/sections/approvalSeo.json`)).default,
            founderGuide: (await import(`@/messages/${l}/sections/founderGuide.json`)).default,


            addressChecker: {
                badges: (await import(`@/messages/${l}/sections/addressChecker.badges.json`)).default,
                map: (await import(`@/messages/${l}/sections/addressChecker.map.json`)).default,
                pois: (await import(`@/messages/${l}/sections/addressChecker.pois.json`)).default,
                risk: (await import(`@/messages/${l}/sections/addressChecker.risk.json`)).default,
                search: (await import(`@/messages/${l}/sections/addressChecker.search.json`)).default,
            },

            complianceChecker: {
                form: (await import(`@/messages/${l}/sections/complianceChecker.form.json`)).default
            },

            complianceResult: {
                labels: (await import(`@/messages/${l}/sections/complianceResult.labels.json`)).default,
                gfvo: (await import(`@/messages/${l}/sections/complianceResult.gfvo.json`)).default,
                reasons: (await import(`@/messages/${l}/sections/complianceResult.reasons.json`)).default,
                classifications: (await import(`@/messages/${l}/sections/complianceResult.classifications.json`)).default,
                content: (await import(`@/messages/${l}/sections/complianceResult.content.json`)).default,
                disclaimer: (await import(`@/messages/${l}/sections/complianceResult.disclaimer.json`)).default,
                downloadDocuments: (await import(`@/messages/${l}/sections/complianceResult.downloadDocuments.json`)).default
            },

            faq: {
                cta: (await import(`@/messages/${l}/sections/faq.cta.json`)).default,
                groups: (await import(`@/messages/${l}/sections/faq.groups.json`)).default,
                questions: (await import(`@/messages/${l}/sections/faq.questions.json`)).default
            }
        }) as AbstractIntlMessages,

    legal: async (l) =>
        ({
            privacy: (await import(`@/messages/${l}/legal/privacy.json`)).default,
            imprint: (await import(`@/messages/${l}/legal/imprint.json`)).default,
        }) as AbstractIntlMessages,

    seo: async (l) =>
        ({
            routes: (await import(`@/messages/${l}/seo/routes.json`)).default
        }) as AbstractIntlMessages
};

// Loads all bundles and merges them
export async function loadAllMessages(locale: Locale): Promise<AbstractIntlMessages> {
    const entries = await Promise.all(
        Object.entries(messageBundles).map(async ([key, loader]) => [key, await loader(locale)] as const)
    );

    return Object.fromEntries(entries) as AbstractIntlMessages;
}
