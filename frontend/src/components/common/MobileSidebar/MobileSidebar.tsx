"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import styles from "./MobileSidebar.module.css";

import LanguageSwitcher from "../navigation/LanguageSwitcher";
import type { Locale } from "@/i18n/locales";

import { Button } from "@/components/ui/Button";
import { PRIMARY_NAV, SECONDARY_NAV, href } from "@/navigation/nav";
import { useIsActivePath } from "@/components/hooks/useIsActivePath";
import SidebarNavLink from "./SidebarNavLink";
import { SectionSeparator } from "@/components/layout/SectionSeperator";
import BreakPoint from "../BreakPoint";
import { useAuth } from "@/context/AuthContext";
import { SidebarDropdown } from "./SidebarDropdown";

// --- fokussierbare Elemente ---
const focusableSelectors = [
    'a[href]',
    "button:not([disabled])",
    "textarea",
    'input[type="text"]',
    'input[type="radio"]',
    'input[type="checkbox"]',
    "select",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

// --- Expandable Dropdown für mobile ---


// --- Sidebar ---
interface MobileSidebarProps {
    locale: Locale;
    open: boolean;
    onClose: () => void;
}

export default function MobileSidebar({ locale, open, onClose }: MobileSidebarProps) {
    const tNav = useTranslations("common.navigation");
    const tItems = useTranslations("common.items");
    const tActions = useTranslations("common.actions");
    const { user, isLoading, logout } = useAuth();
    const drawerRef = useRef<HTMLDivElement | null>(null);
    const lastFocusedElement = useRef<HTMLElement | null>(null);

    const primary = useMemo(() => PRIMARY_NAV, []);
    const secondary = useMemo(() => SECONDARY_NAV, []);
    const isActive = useIsActivePath(locale);

    // Focus trap
    useEffect(() => {
        if (!open) return;
        lastFocusedElement.current = document.activeElement as HTMLElement;

        const drawer = drawerRef.current;
        const focusableItems = drawer
            ? Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelectors))
            : [];

        focusableItems[0]?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
            if (event.key !== "Tab" || focusableItems.length === 0) return;

            const first = focusableItems[0];
            const last = focusableItems[focusableItems.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
            else if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            lastFocusedElement.current?.focus();
        };
    }, [open, onClose]);

    return (
        <div
            className={`${styles.mobileSidebar} ${open ? styles.open : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={tNav("navigation")}
            aria-hidden={!open}
            id="mobile-sidebar"
        >
            <button
                type="button"
                aria-label={tNav("menu.close")}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className={styles.backdrop}
            />

            <div ref={drawerRef} className={styles.drawer} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.topRow}>
                        <Link href={`/${locale}`} className={styles.brand} onClick={onClose} tabIndex={open ? 0 : -1}>
                            <Image
                                src="/assets/icons/icon.svg"
                                alt=""
                                width={32}
                                height={32}
                                className="h-9 w-9"
                                style={{ borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-xs)" }}
                            />
                            <div className={styles.brandTitle}>{tItems("app")}</div>
                        </Link>

                        <Button variant="secondary" size="icon" onClick={onClose} aria-label={tNav("menu.close")} tabIndex={open ? 0 : -1} className={styles.close}>
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        </Button>
                    </div>
                    <SectionSeparator />
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <div className={styles.sectionLabel}>{tNav("aria.primaryMenu")}</div>

                    <nav className={styles.nav}>
                        {primary.map((link) => {
                            if (!link.key) return null;

                            if (link.children) {
                                return (
                                    <SidebarDropdown
                                        key={link.labelKey}
                                        item={link}
                                        locale={locale}
                                        open={open}
                                        onClose={onClose}
                                    />
                                );
                            }

                            const linkHref = href(locale, link.key);
                            return (
                                <SidebarNavLink
                                    key={link.key}
                                    href={linkHref}
                                    active={isActive(linkHref)}
                                    onClick={onClose}
                                    aria-current={isActive(linkHref) ? "page" : undefined}
                                    tabIndex={open ? 0 : -1}
                                >
                                    <span>{tItems(link.labelKey)}</span>
                                </SidebarNavLink>
                            );
                        })}
                    </nav>

                    <BreakPoint />
                    <SectionSeparator />

                    <div className={styles.sectionLabel}>{tNav("menu.more")}</div>

                    <nav className={styles.nav}>
                        {secondary.map((link) => {
                            if (!link.key) return null;
                            const linkHref = href(locale, link.key);
                            const active = isActive(linkHref);
                            return (
                                <Link
                                    key={link.key}
                                    href={linkHref}
                                    onClick={onClose}
                                    aria-current={active ? "page" : undefined}
                                    className={`${styles.item} ${styles["item--secondary"]} ${active ? styles.active : ""}`}
                                    tabIndex={open ? 0 : -1}
                                >
                                    {tItems(link.labelKey)}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <BreakPoint />

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.footerInner}>
                        {!isLoading && (
                            <div className="flex w-full items-center justify-between gap-2 px-3 pb-2">
                                {user ? (
                                    <>
                                        <span className="max-w-40 truncate text-sm opacity-70">{user.email}</span>
                                        <Button variant="ghost" size="sm" onClick={() => { logout(); onClose(); }} tabIndex={open ? 0 : -1}>
                                            {tActions("auth.logout")}
                                        </Button>
                                    </>
                                ) : (
                                    <Link href={`/${locale}/login`} onClick={onClose} tabIndex={open ? 0 : -1} className="w-full">
                                        <Button variant="primary" size="sm" className="w-full">
                                            {tActions("auth.login")}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                        <LanguageSwitcher direction="up" />
                    </div>
                </div>
            </div>
        </div>
    );
}