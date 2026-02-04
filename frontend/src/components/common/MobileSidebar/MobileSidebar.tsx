"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import styles from "./MobileSidebar.module.css";

import LanguageSwitcher from "../navigation/LanguageSwitcher";
import type { Locale } from "@/i18n/locales";

import { Button } from "@/components/ui/Button";
import { primaryLinks, secondaryLinks } from "@/lib/config/nav";
import { useIsActivePath } from "@/components/hooks/useIsActivePath";

interface MobileSidebarProps {
    locale: Locale;
    open: boolean;
    onClose: () => void;
}

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

export default function MobileSidebar({ locale, open, onClose }: MobileSidebarProps) {
    const tNav = useTranslations("common.navigation");
    const tItems = useTranslations("common.items")
    const drawerRef = useRef<HTMLDivElement | null>(null);
    const lastFocusedElement = useRef<HTMLElement | null>(null);
    const pathname = usePathname();

    const primary = useMemo(() => primaryLinks(locale), [locale]);
    const secondary = useMemo(() => secondaryLinks(locale), [locale]);

    useEffect(() => {
        if (!open) return;

        lastFocusedElement.current = document.activeElement as HTMLElement;

        const drawer = drawerRef.current;
        const focusableItems = drawer
            ? Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelectors))
            : [];

        focusableItems[0]?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== "Tab" || focusableItems.length === 0) return;

            const first = focusableItems[0];
            const last = focusableItems[focusableItems.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            } else if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            lastFocusedElement.current?.focus();
        };
    }, [open, onClose]);

    const isActive = useIsActivePath(locale)

    return (
        <div
            className={`${styles.mobileSidebar} ${open ? styles.open : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={tNav("navigation")}
            aria-hidden={!open}
            id="mobile-sidebar"
        >
            {/* Backdrop: UI Button, aber neutralisiert */}
            <Button
                variant="secondary"
                aria-label={tNav("menu.close")}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className={[
                    styles.backdrop,
                    // Button.tsx bringt Padding/Inline-Flex mit -> hier bewusst neutralisieren
                    "p-0 m-0 border-0 rounded-none shadow-none bg-transparent hover:bg-transparent",
                ].join(" ")}
            />

            <div
                ref={drawerRef}
                className={styles.drawer}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <div className={styles.topRow}>
                        <Link
                            href={`/${locale}`}
                            className={styles.brand}
                            onClick={onClose}
                            tabIndex={open ? 0 : -1}
                        >
                            <Image
                                src="/icon.svg"
                                alt=""
                                width={32}
                                height={32}
                                className="h-9 w-9"
                                style={{
                                    borderRadius: "var(--radius-sm)",
                                    boxShadow: "var(--shadow-xs)",
                                }}
                            />
                            <div>
                                {/* falls das bei dir unter item.bac liegt -> hier wieder tItem("bac") */}
                                <div className={styles.brandTitle}>{tItems("app")}</div>
                                <div className={styles.brandSub}>{tNav("navigation")}</div>
                            </div>
                        </Link>

                        {/* Close: UI Button (icon) + overrides */}
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            aria-label={tNav("menu.close")}
                            tabIndex={open ? 0 : -1}
                            className={[
                                styles.close,
                                // klein machen
                                "p-2 w-auto h-auto",
                            ].join(" ")}
                        >
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                aria-hidden
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        </Button>
                    </div>

                    <div className={styles.divider} />
                </div>

                <div className={styles.content}>
                    <div className={styles.sectionLabel}>{tNav("aria.primaryMenu")}</div>

                    <nav className={styles.nav}>
                        {primary.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    aria-current={active ? "page" : undefined}
                                    className={`${styles.item} ${active ? styles.active : ""}`}
                                    tabIndex={open ? 0 : -1}
                                >
                                    <span>{tItems(link.labelKey.replace("item.", ""))}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className={styles.spacer} />
                    <div className={styles.divider} style={{ margin: "0 12px" }} />
                    <div className={styles.spacer} />

                    <div className={styles.sectionLabel}>{tNav("menu.more")}</div>

                    <nav className={styles.nav}>
                        {secondary.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    aria-current={active ? "page" : undefined}
                                    className={`${styles.item} ${styles["item--secondary"]} ${active ? styles.active : ""}`}
                                    tabIndex={open ? 0 : -1}
                                >
                                    {tItems(link.labelKey.replace("item.", ""))}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className={styles.footer}>
                    <div className={styles.footerInner}>
                        <LanguageSwitcher direction="up" />
                    </div>
                </div>
            </div>
        </div>
    );
}