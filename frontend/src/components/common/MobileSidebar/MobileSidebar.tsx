"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { ChevronDown, FileText, Wand2 } from "lucide-react";

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
    const [isDocsExpanded, setIsDocsExpanded] = useState(false);

    const primary = useMemo(() => PRIMARY_NAV, []);
    const secondary = useMemo(() => SECONDARY_NAV, []);

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
            <button
                type="button"
                aria-label={tNav("menu.close")}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className={styles.backdrop}
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
                                src="/assets/icons/icon.svg"
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
                                <div className={styles.brandTitle}>{tItems("app")}</div>

                            </div>
                        </Link>

                        {/* Close: UI Button (icon) + overrides */}
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={onClose}
                            aria-label={tNav("menu.close")}
                            tabIndex={open ? 0 : -1}
                            className={styles.close}
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

                    <SectionSeparator />
                </div>

                <div className={styles.content}>
                    <div className={styles.sectionLabel}>{tNav("aria.primaryMenu")}</div>

                    <nav className={styles.nav}>
                        {primary.map((link) => {
                            const linkHref = href(locale, link.key);
                            const active = isActive(linkHref);

                            if (link.key === "documents") {
                                const docsActive = active || isActive(`/${locale}/betriebsbeschreibung`);
                                return (
                                    <div key={link.key}>
                                        <button
                                            onClick={() => setIsDocsExpanded(v => !v)}
                                            tabIndex={open ? 0 : -1}
                                            aria-expanded={isDocsExpanded}
                                            className={`${styles.item} ${styles.expandTrigger} ${docsActive ? styles.active : ""}`}
                                        >
                                            <span>{tItems(link.labelKey.replace("item.", ""))}</span>
                                            <ChevronDown className={`${styles.expandChevron} ${isDocsExpanded ? styles.expandChevronOpen : ""}`} aria-hidden />
                                        </button>

                                        {isDocsExpanded && (
                                            <div className={styles.subNav}>
                                                <Link
                                                    href={linkHref}
                                                    onClick={onClose}
                                                    tabIndex={open ? 0 : -1}
                                                    aria-current={isActive(linkHref) ? "page" : undefined}
                                                    className={`${styles.subItem} ${isActive(linkHref) ? styles.active : ""}`}
                                                >
                                                    <FileText className={styles.subItemIcon} aria-hidden />
                                                    <span>
                                                        <span className={styles.subItemLabel}>Benötigte Unterlagen</span>
                                                        <span className={styles.subItemDesc}>Pflichtdokumente-Checkliste</span>
                                                    </span>
                                                </Link>
                                                <Link
                                                    href={`/${locale}/betriebsbeschreibung`}
                                                    onClick={onClose}
                                                    tabIndex={open ? 0 : -1}
                                                    aria-current={isActive(`/${locale}/betriebsbeschreibung`) ? "page" : undefined}
                                                    className={`${styles.subItem} ${isActive(`/${locale}/betriebsbeschreibung`) ? styles.active : ""}`}
                                                >
                                                    <Wand2 className={styles.subItemIcon} aria-hidden />
                                                    <span>
                                                        <span className={styles.subItemLabel}>Dokumenten-Assistent</span>
                                                        <span className={styles.subItemDesc}>Betriebsbeschreibung als PDF</span>
                                                    </span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <SidebarNavLink
                                    key={link.key}
                                    href={linkHref}
                                    active={active}
                                    onClick={onClose}
                                    aria-current={active ? "page" : undefined}
                                    tabIndex={open ? 0 : -1}
                                >
                                    <span>{tItems(link.labelKey.replace("item.", ""))}</span>
                                </SidebarNavLink>
                            );
                        })}
                    </nav>
                    <BreakPoint />
                    <SectionSeparator />

                    <div className={styles.sectionLabel}>{tNav("menu.more")}</div>

                    <nav className={styles.nav}>
                        {secondary.map((link) => {
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
                                    {tItems(link.labelKey.replace("item.", ""))}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <BreakPoint />
                <div className={styles.footer}>
                    <div className={styles.footerInner}>
                        <LanguageSwitcher direction="up" />
                    </div>
                </div>
            </div>
        </div>
    );
}