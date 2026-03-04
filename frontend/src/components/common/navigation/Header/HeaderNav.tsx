"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useTranslations } from "next-intl";
import { ChevronDown, FileText, Wand2 } from "lucide-react";

import type { Locale } from "@/i18n/locales";
import { PRIMARY_NAV, href } from "@/navigation/nav";
import { useIsActivePath } from "@/components/hooks/useIsActivePath";

import { Button } from "@/components/ui/Button";

import LanguageSwitcher from "../LanguageSwitcher";
import MobileSidebar from "@/components/common/MobileSidebar/MobileSidebar";

import styles from "./HeaderNav.module.css";

interface HeaderNavProps {
    locale: Locale;
}

export default function HeaderNav({ locale }: HeaderNavProps) {
    const tItems = useTranslations("common.items");
    const tNav = useTranslations("common.navigation");

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDocsOpen, setIsDocsOpen] = useState(false);
    const docsRef = useRef<HTMLDivElement>(null);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    const isActive = useIsActivePath(locale);
    const links = useMemo(() => PRIMARY_NAV, []);

    // Close docs dropdown on outside click
    useEffect(() => {
        if (!isDocsOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (docsRef.current && !docsRef.current.contains(e.target as Node)) {
                setIsDocsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isDocsOpen]);

    useEffect(() => {
        if (!isSidebarOpen) return;
    }, [isSidebarOpen]);

    return (
        <header className={`${styles.header} sticky top-0 z-50`}>
            <div className="w-full px-6 lg:px-10">
                <div className="flex h-14 items-center justify-between gap-3">
                    {/* Brand */}
                    <div className="flex min-w-0 flex-shrink-0 items-center">
                        <Link href={`/${locale}`} className="flex items-center gap-2">
                            <Image
                                src="/assets/icons/icon.svg"
                                alt=""
                                width={28}
                                height={28}
                                className="h-7 w-7 rounded-lg shadow-sm"
                            />
                            <span className="ml-2 text-sm font-semibold text-current lg:hidden">
                                {tItems("app")}
                            </span>
                            <span className="ml-2 hidden truncate text-sm font-semibold text-current lg:inline">
                                {tItems("app")}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <nav
                        className="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-x-6 gap-y-2 lg:flex"
                        aria-label={tNav("aria.primaryMenu")}
                    >
                        {links.map((link) => {
                            const linkHref = href(locale, link.key);
                            const active = isActive(linkHref);

                            if (link.key === "documents") {
                                const docsActive = active || isActive(`/${locale}/betriebsbeschreibung`);
                                return (
                                    <div key={link.key} ref={docsRef} className={styles.dropdownWrapper}>
                                        <button
                                            onClick={() => setIsDocsOpen(v => !v)}
                                            className={`${styles.navLink} ${styles.dropdownTrigger} ${docsActive ? styles.navLinkActive : styles.navLinkInactive}`}
                                            aria-expanded={isDocsOpen}
                                            aria-haspopup="menu"
                                        >
                                            {tItems(link.labelKey)}
                                            <ChevronDown className={`${styles.dropdownChevron} ${isDocsOpen ? styles.dropdownChevronOpen : ""}`} />
                                        </button>

                                        {isDocsOpen && (
                                            <div className={styles.dropdown} role="menu">
                                                <Link
                                                    href={linkHref}
                                                    role="menuitem"
                                                    onClick={() => setIsDocsOpen(false)}
                                                    className={`${styles.dropdownItem} ${isActive(linkHref) ? styles.dropdownItemActive : ""}`}
                                                >
                                                    <FileText className={styles.dropdownItemIcon} aria-hidden />
                                                    <span>
                                                        <span className={styles.dropdownItemLabel}>Benötigte Unterlagen</span>
                                                        <span className={styles.dropdownItemDesc}>Checkliste aller Pflichtdokumente</span>
                                                    </span>
                                                </Link>
                                                <Link
                                                    href={`/${locale}/betriebsbeschreibung`}
                                                    role="menuitem"
                                                    onClick={() => setIsDocsOpen(false)}
                                                    className={`${styles.dropdownItem} ${isActive(`/${locale}/betriebsbeschreibung`) ? styles.dropdownItemActive : ""}`}
                                                >
                                                    <Wand2 className={styles.dropdownItemIcon} aria-hidden />
                                                    <span>
                                                        <span className={styles.dropdownItemLabel}>Dokumenten-Assistent</span>
                                                        <span className={styles.dropdownItemDesc}>Betriebsbeschreibung als PDF</span>
                                                    </span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={link.key}
                                    href={linkHref}
                                    className={`${styles.navLink} ${active ? styles.navLinkActive : styles.navLinkInactive}`}
                                    aria-current={active ? "page" : undefined}
                                >
                                    {tItems(link.labelKey)}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile menu button */}
                    <div className="flex flex-shrink-0 items-center lg:hidden">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className={styles.menuButton}
                            aria-label={tNav("menu.open")}
                            aria-expanded={isSidebarOpen}
                            aria-controls="mobile-sidebar"
                        >
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                aria-hidden
                            >
                                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                            </svg>
                        </Button>
                    </div>

                    {/* Desktop language switcher */}
                    <div className="hidden min-w-0 flex-shrink-0 items-center gap-3 lg:flex">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>

            <MobileSidebar
                locale={locale}
                open={isSidebarOpen}
                onClose={closeSidebar}
            />
        </header>
    );
}
