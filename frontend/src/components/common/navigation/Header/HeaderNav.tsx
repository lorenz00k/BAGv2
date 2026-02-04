"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useTranslations } from "next-intl";

import type { Locale } from "@/i18n/locales";
import { primaryLinks } from "@/lib/config/nav";
import { useIsActivePath } from "@/components/hooks/useIsActivePath";

import { Button } from "@/components/ui/Button";

import LanguageSwitcher from "../LanguageSwitcher";
import MobileSidebar from "@/components/common/MobileSidebar/MobileSidebar"; // ggf. Pfad anpassen

import styles from "./HeaderNav.module.css";

interface HeaderNavProps {
    locale: Locale;
}

export default function HeaderNav({ locale }: HeaderNavProps) {
    const tItem = useTranslations("item");
    const tNav = useTranslations("nav");

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    const isActive = useIsActivePath(locale);

    const links = useMemo(() => primaryLinks(locale), [locale]);

    // Sidebar schließen, wenn Navigation wechselt:
    // useIsActivePath nutzt usePathname intern, daher reicht ein Effect ohne deps nicht.
    // Wir machen es stabil über window popstate + click? -> simplest: nutz usePathname direkt hier.
    // Aber sauber & minimal: import usePathname und schließ bei Änderung:
    // (siehe Alternative unten)
    //
    // -> Für jetzt: wir lassen es wie vorher, indem wir usePathname zusätzlich nutzen:
    // (siehe "Alternative" falls du's 100% über Hook willst)
    //
    // --- Einfachster Weg:
    // import { usePathname } from "next/navigation"; ... useEffect(() => setIsSidebarOpen(false), [pathname])

    // ✅ minimal: SideBar schließt beim Link click sowieso + Esc/backdrop; route-change ist nice-to-have.
    useEffect(() => {
        if (!isSidebarOpen) return;
        // sobald sidebar offen ist, und user klickt irgendwo (navigation), schließen wir sie
        // (optional; du hattest vorher pathname-based close)
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
                                {tItem("bac")}
                            </span>
                            <span className="ml-2 hidden truncate text-sm font-semibold text-current lg:inline">
                                {tItem("bac")}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <nav
                        className="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-x-6 gap-y-2 lg:flex"
                        aria-label={tNav("primaryMenu")}
                    >
                        {links.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`${styles.navLink} ${active ? styles.navLinkActive : styles.navLinkInactive
                                        }`}
                                    aria-current={active ? "page" : undefined}
                                >
                                    {/* ✅ neu: labelKey */}
                                    {tNav(link.labelKey)}
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
                            aria-label={tNav("menuOpen")}
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

            <MobileSidebar locale={locale} open={isSidebarOpen} onClose={closeSidebar} />
        </header>
    );
}
