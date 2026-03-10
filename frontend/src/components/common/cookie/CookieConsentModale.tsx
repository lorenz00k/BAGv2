"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import type { Locale } from "@/i18n/locales"
import { href } from "@/navigation/nav"
import { Button } from "@/components/ui/Button"
import { applyGtagConsent, cleanupGaCookiesIfDenied, CONSENT_VERSION, ConsentValue, readStored, writeStored } from "./consentStore"
import { Heading } from "@/components/typography/Heading"
import { Text } from "@/components/typography/Text"


declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void
        showCookieSettings?: () => void
    }
}

export default function CookieConsentModal({ locale, onAnalyticsChange }: { locale: Locale, onAnalyticsChange?: (allowed: boolean) => void }) {
    const t = useTranslations("legal.cookieConsent")

    const [open, setOpen] = useState(false)

    // (minimal) Settings: nur Analytics toggle — kann später erweitert werden
    const [analytics, setAnalytics] = useState(false)

    const privacyHref = useMemo(() => href(locale, "privacy"), [locale])

    // initial decide: show if none or version changed
    useEffect(() => {
        const saved = readStored()
        console.log("cookie saved:", saved)
        if (!saved || saved.v !== CONSENT_VERSION) {
            setOpen(true)
            setAnalytics(false)
            return
        }

        setAnalytics(!!saved.analytics)
        applyGtagConsent(!!saved.analytics)
    }, [])

    // make footer link work
    useEffect(() => {
        window.showCookieSettings = () => setOpen(true)
        return () => {
            delete window.showCookieSettings
        }
    }, [])

    // scroll lock
    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    function save(next: { value: ConsentValue; analytics: boolean }) {
        const granted = !!next.analytics

        applyGtagConsent(granted)

        if (!granted) cleanupGaCookiesIfDenied()

        if (granted) {
            // optional: initial page_view nach Consent
            window.gtag?.("event", "page_view", {
                page_title: document.title,
                page_location: location.href,
                page_path: location.pathname,
            })
        }

        writeStored({
            v: CONSENT_VERSION,
            t: Date.now(),
            value: next.value,
            analytics: next.analytics,
        })
        onAnalyticsChange?.(granted)

        setOpen(false)
    }

    function acceptAll() {
        setAnalytics(true)
        save({ value: "accepted", analytics: true })
    }

    function onlyNecessary() {
        setAnalytics(false)
        save({ value: "rejected", analytics: false })
    }

    function saveCustom() {
        save({ value: "custom", analytics })
    }

    if (!open) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-consent-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <Heading as="h2" id="cookie-consent-title" className="text-lg font-semibold mb-2">
                    {t("title")}
                </Heading>

                <Text className="text-sm text-gray-700 mb-4">
                    {t.rich("description", {
                        strong: (chunks) => <strong>{chunks}</strong>,
                        privacy: (chunks) => (
                            <Link href={privacyHref} className="underline">
                                {chunks}
                            </Link>
                        ),
                    })}
                </Text>

                {/* Settings block */}
                <div className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-sm font-medium">{t("analyticsTitle")}</div>
                            <div className="text-xs text-gray-600 mt-1">{t("analyticsDesc")}</div>
                        </div>

                        {/* simple checkbox toggle (kannst du später durch Switch ersetzen) */}
                        <input
                            type="checkbox"
                            checked={analytics}
                            onChange={(e) => setAnalytics(e.target.checked)}
                            className="mt-1 h-4 w-4"
                            aria-label={t("analyticsTitle")}
                        />
                    </div>

                    <Text className="mt-3 text-xs text-gray-500">{t("necessaryAlwaysOn")}</Text>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={onlyNecessary}>
                        {t("onlyNecessary")}
                    </Button>

                    <Button type="button" variant="outline" onClick={saveCustom}>
                        {t("save")}
                    </Button>

                    <Button type="button" onClick={acceptAll}>
                        {t("acceptAll")}
                    </Button>
                </div>

                <Text className="mt-4 text-xs text-gray-500">{t("hint")}</Text>
            </div>
        </div>
    )
}
