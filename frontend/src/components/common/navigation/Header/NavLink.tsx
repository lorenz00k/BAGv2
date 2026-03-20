// --- Simple Nav Link ---
'use client';

import { useIsActivePath } from "@/components/hooks/useIsActivePath";
import { Locale } from "@/i18n/locales";
import { href, NavItem } from "@/navigation/nav";
import { useTranslations } from "next-intl";
import styles from "./HeaderNav.module.css";
import Link from "next/link";

export function NavLink({ item, locale }: { item: NavItem; locale: Locale }) {
    const tItems = useTranslations("common.items");
    const isActive = useIsActivePath(locale);
    if (!item.key) return null;
    const linkHref = href(locale, item.key);

    return (
        <Link
            href={linkHref}
            className={`${styles.navLink} ${isActive(linkHref) ? styles.navLinkActive : styles.navLinkInactive}`}
            aria-current={isActive(linkHref) ? "page" : undefined}
        >
            {tItems(item.labelKey)}
        </Link>
    );
}