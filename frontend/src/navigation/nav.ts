import type { Locale } from "@/i18n/locales";
import { ROUTES, type RouteKey } from "./routes";

export type NavLabelKey =
    | "complianceChecker"
    | "gastroAi"
    | "addressChecker"
    | "faq"
    | "imprint"
    | "privacy";

export type NavItem = {
    key: RouteKey;
    labelKey: NavLabelKey; // passt zu common.items.*
};

export const PRIMARY_NAV: NavItem[] = [
    { key: "complianceChecker", labelKey: "complianceChecker" },
    { key: "gastroAi", labelKey: "gastroAi" },
    { key: "addressChecker", labelKey: "addressChecker" },
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
