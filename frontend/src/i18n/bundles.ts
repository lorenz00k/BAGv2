// src/i18n/bundles.ts
// show which message bundles exist

import type { AbstractIntlMessages } from "next-intl";
import type { Locale } from "./locales";

type Loader = (l: Locale) => Promise<AbstractIntlMessages>;

// Keys sind eure Namespaces im messages-Objekt
export const messageBundles: Record<string, Loader> = {
    // common
    commonActions: (l) =>
        import(`@/messages/${l}/common/actions.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    commonLabels: (l) =>
        import(`@/messages/${l}/common/labels.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    commonItems: (l) =>
        import(`@/messages/${l}/common/items.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),

    // components
    featureCards: (l) =>
        import(`@/messages/${l}/components/featureCards.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    footer: (l) =>
        import(`@/messages/${l}/components/footer.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    stats: (l) =>
        import(`@/messages/${l}/components/stats.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),

    // pages
    home: (l) =>
        import(`@/messages/${l}/pages/home.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    faqPage: (l) =>
        import(`@/messages/${l}/pages/faq.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    addressCheckerPage: (l) =>
        import(`@/messages/${l}/pages/addressChecker.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    complianceCheckerPage: (l) =>
        import(`@/messages/${l}/pages/complianceChecker.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    complianceResultPage: (l) =>
        import(`@/messages/${l}/pages/complianceResult.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),

    // sections - address check
    addressCheckBadges: (l) =>
        import(`@/messages/${l}/sections/addressCheck.badges.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    addressCheckMap: (l) =>
        import(`@/messages/${l}/sections/addressCheck.map.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    addressCheckPois: (l) =>
        import(`@/messages/${l}/sections/addressCheck.pois.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    addressCheckRisk: (l) =>
        import(`@/messages/${l}/sections/addressCheck.risk.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    addressCheckSearch: (l) =>
        import(`@/messages/${l}/sections/addressCheck.search.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),

    // sections - home
    approvalFlow: (l) =>
        import(`@/messages/${l}/sections/approvalFlow.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    approvalSeo: (l) =>
        import(`@/messages/${l}/sections/approvalSeo.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    checkerIntro: (l) =>
        import(`@/messages/${l}/sections/checkerIntro.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    founderGuide: (l) =>
        import(`@/messages/${l}/sections/founderGuide.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),

    // sections - compliance checker
    complianceCheckerForm: (l) =>
        import(`@/messages/${l}/sections/complianceChecker.form.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),

    // sections - compliance result
    complianceResultClassification: (l) =>
        import(`@/messages/${l}/sections/complianceResult.classification.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    complianceResultContent: (l) =>
        import(`@/messages/${l}/sections/complianceResult.content.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    complianceResultDisclaimer: (l) =>
        import(`@/messages/${l}/sections/complianceResult.disclaimer.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    complianceResultDownloadDocuments: (l) =>
        import(`@/messages/${l}/sections/complianceResult.downloadDocuments.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    complianceResultGfvo: (l) =>
        import(`@/messages/${l}/sections/complianceResult.gfvo.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    complianceResultLabels: (l) =>
        import(`@/messages/${l}/sections/complianceResult.labels.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    complianceResultReasons: (l) =>
        import(`@/messages/${l}/sections/complianceResult.reasons.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),

    // sections - faq
    faqCta: (l) =>
        import(`@/messages/${l}/sections/faq.cta.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    faqGroups: (l) =>
        import(`@/messages/${l}/sections/faq.groups.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),
    faqQuestions: (l) =>
        import(`@/messages/${l}/sections/faq.questions.json`).then(
            (m) => m.default as AbstractIntlMessages
        ),

    // seo
    routes: (l) =>
        import(`@/messages/${l}/seo/routes.json`).then(
            (m) => m.default as AbstractIntlMessages
        )
};

// Lädt alle Bundles generisch
export async function loadAllMessages(locale: Locale): Promise<AbstractIntlMessages> {
    const entries = await Promise.all(
        Object.entries(messageBundles).map(async ([key, loader]) => [key, await loader(locale)] as const)
    );

    return Object.fromEntries(entries) as AbstractIntlMessages;
}
