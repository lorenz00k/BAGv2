
export type ConsentValue = "accepted" | "rejected" | "custom"

export const STORAGE_KEY = "cookie-consent"
export const CONSENT_VERSION = "2025-10"

export type StoredConsent = {
    v: string
    t: number
    value: ConsentValue
    analytics: boolean
}

export function readStored(): StoredConsent | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw) as StoredConsent
    } catch {
        return null
    }
}

export function writeStored(next: StoredConsent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function applyGtagConsent(analyticsGranted: boolean) {
    window.gtag?.("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: analyticsGranted ? "granted" : "denied",
    })
}

export function cleanupGaCookiesIfDenied() {
    const domain = window.location.hostname
    const opts = (d: string) =>
        `; Path=/; Domain=${d}; Max-Age=0; SameSite=Lax; ${location.protocol === "https:" ? "Secure" : ""}`

    document.cookie = `_ga=;${opts(domain)}`
    document.cookie = `_ga=;${opts("." + domain)}`

    const gaProp = document.cookie.match(/_ga_[^=]+/g) || []
    gaProp.forEach((name) => {
        document.cookie = `${name}=;${opts(domain)}`
        document.cookie = `${name}=;${opts("." + domain)}`
    })
}
