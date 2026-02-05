"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import type { Locale } from "@/i18n/locales"
import { SECONDARY_NAV, href } from "@/navigation/nav"
import { Button } from "@/components/ui/Button"

import styles from "./Footer.module.css"

declare global {
    interface Window {
        showCookieSettings?: () => void
    }
}

interface FooterProps {
    locale: Locale
}

export default function Footer({ locale }: FooterProps) {
    const tFooter = useTranslations("components.footer")
    const tNav = useTranslations("common.items")

    return (
        <footer className={styles.footer}>
            <div className="site-container">
                <div className={styles.meta}>
                    <p>© 2026 {tFooter("copyright")}</p>
                    <p className="mt-3 text-xs">{tFooter("disclaimer")}</p>
                </div>

                <div className={styles.links}>
                    {SECONDARY_NAV.map((item) => (
                        <Link
                            key={item.key}
                            href={href(locale, item.key)}
                            className={styles.link}
                        >
                            {tNav(item.labelKey)}
                        </Link>
                    ))}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.showCookieSettings?.()}
                        className={styles.link}
                    >
                        {tFooter("links.cookieSettings")}
                    </Button>
                </div>
            </div>
        </footer>
    )
}
