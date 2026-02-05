// app/[locale]/manifest.webmanifest/route.ts
import { NextResponse } from "next/server"
import { locales, defaultLocale, type Locale } from "@/i18n/locales"

async function loadCopy(locale: Locale) {
    const mod = await import(`@/messages/${locale}/seo/manifest.json`).catch(() => null)
    if (mod?.default) return mod.default as { name: string; shortName: string; description: string }

    const fallback = await import(`@/messages/${defaultLocale}/seo/manifest.json`)
    return fallback.default as { name: string; shortName: string; description: string }
}

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ locale: string }> }
) {
    const { locale: raw } = await ctx.params;
    const locale = (locales.includes(raw as Locale) ? raw : defaultLocale) as Locale
    const copy = await loadCopy(locale)

    const manifest = {
        name: copy.name,
        short_name: copy.shortName,
        description: copy.description,

        start_url: `/${locale}/`,
        scope: `/${locale}/`,

        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",

        icons: [
            { src: "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],

        lang: locale === "de" ? "de-AT" : locale,
        dir: "ltr",
        categories: ["business", "government", "utilities"],
    }

    return NextResponse.json(manifest, {
        headers: {
            // wichtig für Manifest
            "Content-Type": "application/manifest+json; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
        },
    })
}
