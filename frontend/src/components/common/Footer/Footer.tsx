"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import type { Locale } from "@/i18n/locales";
import { secondaryLinks } from "@/navigation/nav";
import { Button } from "@/components/ui/Button";

import styles from "./Footer.module.css";

declare global {
    interface Window {
        showCookieSettings?: () => void;
    }
}

interface FooterProps {
    locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
    const tFooter = useTranslations("home.footer");
    const tNav = useTranslations("nav");

    const links = secondaryLinks(locale);

    return (
        <footer className={styles.footer}>
            <div className="site-container">
                <div className={styles.meta}>
                    <p>© 2026 {tFooter("copyright")}</p>
                    <p className="mt-3 text-xs">{tFooter("disclaimer")}</p>
                </div>

                <div className={styles.links}>
                    {links.map((l) => (
                        <Link key={l.href} href={l.href} className={styles.link}>
                            {tNav(l.labelKey)}
                        </Link>
                    ))}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.showCookieSettings?.()}
                        className={styles.link}
                    >
                        {tFooter("cookie")}
                    </Button>
                </div>
            </div>
        </footer>
    );
}
