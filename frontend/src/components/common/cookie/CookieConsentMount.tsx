// src/components/common/cookie/CookieConsentMount.tsx
"use client"

import { useEffect, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import type { Locale } from "@/i18n/locales"
import CookieConsentModal from "./CookieConsentModale"
import { readStored } from "./consentStore"


export default function CookieConsentMount({ locale }: { locale: Locale }) {
    const gaId = process.env.NEXT_PUBLIC_GA_ID
    const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production"

    const [analyticsAllowed, setAnalyticsAllowed] = useState(false)

    useEffect(() => {
        const saved = readStored()
        setAnalyticsAllowed(!!saved?.analytics)
    }, [])

    const shouldLoadGA = isProduction && !!gaId && analyticsAllowed

    return (
        <>
            {shouldLoadGA ? <GoogleAnalytics gaId={gaId!} /> : null}

            <CookieConsentModal
                locale={locale}
                onAnalyticsChange={(allowed) => setAnalyticsAllowed(!!allowed)}
            />
        </>
    )
}
