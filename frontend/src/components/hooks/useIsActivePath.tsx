"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/locales";

export function useIsActivePath(locale: Locale) {
    const pathname = usePathname();

    return (href: string) => {
        if (!pathname) return false;

        if (href === `/${locale}`) {
            return pathname === `/${locale}`;
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };
}
