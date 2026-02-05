import type { MetadataRoute } from "next"
import { locales, type Locale, defaultLocale } from "@/i18n/locales"

type ManifestIcon = NonNullable<MetadataRoute.Manifest["icons"]>[number]

const icon = (src: string, sizes: string, purpose: "any" | "maskable"): ManifestIcon => ({
    src, sizes, type: "image/png", purpose
})

async function loadCopy(locale: Locale) {
    const mod = await import(`@/messages/${locale}/seo/manifest.json`).catch(() => null)
    if (mod?.default) return mod.default as { name: string; shortName: string; description: string }

    const fallback = await import(`@/messages/${defaultLocale}/seo/manifest.json`)
    return fallback.default as { name: string; shortName: string; description: string }
}

export default async function manifest({
    params,
}: {
    params: { locale: string }
}): Promise<MetadataRoute.Manifest> {
    const locale = (locales.includes(params.locale as Locale) ? params.locale : defaultLocale) as Locale
    const copy = await loadCopy(locale)

    return {
        name: copy.name,
        short_name: copy.shortName,
        description: copy.description,
        start_url: `/${locale}/`,
        scope: `/${locale}/`,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        icons: [
            icon("/assets/icons/icon-192.png", "192x192", "any"),
            icon("/assets/icons/icon-192.png", "192x192", "maskable"),
            icon("/assets/icons/icon-512.png", "512x512", "any"),
            icon("/assets/icons/icon-512.png", "512x512", "maskable"),
        ],
        lang: locale === "de" ? "de-AT" : locale,
        dir: "ltr",
        categories: ["business", "government", "utilities"],
    }
}
