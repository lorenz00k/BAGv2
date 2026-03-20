// --- Dropdown Item ---
"use client";

import { useIsActivePath } from "@/components/hooks/useIsActivePath";
import { Locale } from "@/i18n/locales";
import { href, NavItem } from "@/navigation/nav";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import styles from "./HeaderNav.module.css";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export function NavDropdown({ item, locale }: { item: NavItem; locale: Locale }) {
    const tItems = useTranslations("common.items");
    const isActive = useIsActivePath(locale);
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const isAnyChildActive = item.children?.some(
        child => child.key && isActive(href(locale, child.key))
    ) ?? false;

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    return (
        <div ref={ref} className={styles.dropdownWrapper}>
            <button
                onClick={() => setIsOpen(v => !v)}
                className={`${styles.navLink} ${styles.dropdownTrigger} ${isAnyChildActive ? styles.navLinkActive : styles.navLinkInactive}`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                {tItems(item.labelKey)}
                <ChevronDown className={`${styles.dropdownChevron} ${isOpen ? styles.dropdownChevronOpen : ""}`} />
            </button>

            {isOpen && (
                <div className={styles.dropdown} role="menu">
                    {item.children?.map(child => {
                        if (!child.key) return null;
                        const childHref = href(locale, child.key);
                        return (
                            <Link
                                key={child.key}
                                href={childHref}
                                role="menuitem"
                                onClick={() => setIsOpen(false)}
                                className={`${styles.dropdownItem} ${isActive(childHref) ? styles.dropdownItemActive : ""}`}
                            >
                                <span className={styles.dropdownItemLabel}>
                                    {tItems(child.labelKey)}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}