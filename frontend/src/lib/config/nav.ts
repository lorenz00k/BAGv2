import type { Locale } from "@/i18n/locales";

export type NavLabelKey =
    | "complianceChecker"
    | "gastroAi"
    | "addressChecker"
    | "faq"
    | "imprint"
    | "privacy";

export interface NavItem {
    href: string;
    labelKey: NavLabelKey;
}

export const primaryLinks = (locale: Locale): NavItem[] => [
    { href: `/${locale}/compliance-checker`, labelKey: "complianceChecker" },
    { href: `/${locale}/gastro-ai`, labelKey: "gastroAi" },
    { href: `/${locale}/address-checker`, labelKey: "addressChecker" },
    { href: `/${locale}/faq`, labelKey: "faq" },
];

export const secondaryLinks = (locale: Locale): NavItem[] => [
    { href: `/${locale}/imprint`, labelKey: "imprint" },
    { href: `/${locale}/privacy`, labelKey: "privacy" },
];
