"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useTranslations } from "next-intl";

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
    console.log("HeaderNav locale:", locale);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    const isActive = useIsActivePath(locale);
    const links = useMemo(() => PRIMARY_NAV, []);

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
                                src="/icon.svg"
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
                            return (
                                <Link
                                    key={link.key}
                                    href={linkHref}
                                    className={`${styles.navLink} ${active ? styles.navLinkActive : styles.navLinkInactive
                                        }`}
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
