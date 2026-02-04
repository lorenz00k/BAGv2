// show which message bundles exist

import type { AbstractIntlMessages } from "next-intl";
import type { Locale } from "./locales";

type Loader = (l: Locale) => Promise<AbstractIntlMessages>;

// Keys werden eure "Namespaces" im messages-Objekt
export const messageBundles: Record<string, Loader> = {
    home: (l) => import(`@/messages/${l}/home.json`).then((m) => m.default as AbstractIntlMessages),

    nav: (l) => import(`@/messages/${l}/common/navigation.json`).then((m) => m.default as AbstractIntlMessages),
    item: (l) => import(`@/messages/${l}/common/item.json`).then((m) => m.default as AbstractIntlMessages),

    //faq: (l) => import(`@/messages/${l}/faq.json`).then((m) => m.default as AbstractIntlMessages),
    //metadata: (l) => import(`@/messages/${l}/metadata.json`).then((m) => m.default as AbstractIntlMessages),

    //addressChecker: (l) => import(`@/messages/${l}/addressChecker.json`).then((m) => m.default as AbstractIntlMessages),
    //complianceChecker: (l) => import(`@/messages/${l}/complianceChecker.json`).then((m) => m.default as AbstractIntlMessages),
    //complianceResult: (l) => import(`@/messages/${l}/complianceResult.json`).then((m) => m.default as AbstractIntlMessages),
};

// Lädt alle Bundles generisch
export async function loadAllMessages(locale: Locale): Promise<AbstractIntlMessages> {
    const entries = await Promise.all(
        Object.entries(messageBundles).map(async ([key, loader]) => [key, await loader(locale)] as const)
    );

    return Object.fromEntries(entries) as AbstractIntlMessages;
}