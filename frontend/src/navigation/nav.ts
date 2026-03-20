import type { Locale } from "@/i18n/locales";
import { ROUTES, type RouteKey } from "./routes";

export type NavLabelKey =
    | "checks"
    | "complianceChecker"
    | "addressChecker"
    | "fundingChecker"

    | "faq"
    | "imprint"
    | "privacy"

    | "documents"
    | "requiredDocuments"
    | "documentAssistant"
    ;

export type NavItem = {
    key?: RouteKey;     //dropdowns don't need route
    labelKey: NavLabelKey; // passt zu common.items.*
    children?: NavItem[]; //dropdowns
};

export const PRIMARY_NAV: NavItem[] = [
    {
        key: "checks",
        labelKey: "checks",
        children: [
            { key: "complianceChecker", labelKey: "complianceChecker" },
            { key: "addressChecker", labelKey: "addressChecker" },
            { key: "fundingChecker", labelKey: "fundingChecker" },
        ],
    },
    {
        key: "documents",
        labelKey: "documents",
        children: [
            { key: "requiredDocuments", labelKey: "requiredDocuments" },
            { key: "documentAssistant", labelKey: "documentAssistant" }
        ],
    },
    { key: "faq", labelKey: "faq" },
];

export const SECONDARY_NAV: NavItem[] = [
    { key: "imprint", labelKey: "imprint" },
    { key: "privacy", labelKey: "privacy" },
];

export function href(locale: Locale, key: RouteKey) {
    // locale MUSS existieren; wenn nicht, ist dein Routing kaputt (siehe Layout)
    return `/${locale}${ROUTES[key]}`;
}
