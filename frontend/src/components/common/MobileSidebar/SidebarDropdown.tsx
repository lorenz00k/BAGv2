"use client";

import { useState } from "react";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import styles from "./MobileSidebar.module.css";

import type { Locale } from "@/i18n/locales";
import type { NavItem } from "@/navigation/nav";

import { href } from "@/navigation/nav";
import { useIsActivePath } from "@/components/hooks/useIsActivePath";

export function SidebarDropdown({
    item,
    locale,
    open,
    onClose,
}: {
    item: NavItem;
    locale: Locale;
    open: boolean;
    onClose: () => void;
}) {
    const tItems = useTranslations("common.items");
    const isActive = useIsActivePath(locale);
    const [isExpanded, setIsExpanded] = useState(false);

    const isAnyChildActive = item.children?.some(
        child => child.key && isActive(href(locale, child.key))
    ) ?? false;

    return (
        <div>
            <button
                onClick={() => setIsExpanded(v => !v)}
                tabIndex={open ? 0 : -1}
                aria-expanded={isExpanded}
                className={`${styles.item} ${styles.expandTrigger} ${isAnyChildActive ? styles.active : ""}`}
            >
                <span>{tItems(item.labelKey)}</span>
                <ChevronDown
                    className={`${styles.expandChevron} ${isExpanded ? styles.expandChevronOpen : ""}`}
                    aria-hidden
                />
            </button>

            {isExpanded && (
                <div className={styles.subNav}>
                    {item.children?.map(child => {
                        if (!child.key) return null;
                        const childHref = href(locale, child.key);
                        return (
                            <Link
                                key={child.key}
                                href={childHref}
                                onClick={onClose}
                                tabIndex={open ? 0 : -1}
                                aria-current={isActive(childHref) ? "page" : undefined}
                                className={`${styles.subItem} ${isActive(childHref) ? styles.active : ""}`}
                            >
                                <span>
                                    <span className={styles.subItemLabel}>
                                        {tItems(child.labelKey)}
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}