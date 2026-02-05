import createMiddleware from "next-intl/middleware";
import { locales } from "@/i18n/locales";
import { NextResponse, type NextRequest } from "next/server";
import { CAMEL_TO_KEBAB, KEBAB_TO_CAMEL } from "@/navigation/route-alias";

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: 'de',
    localePrefix: 'as-needed'
});

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    // pathname z.B. "/de/compliance-checker" oder "/compliance-checker"

    // 1) Erst intl / locale handling laufen lassen (redirect / -> /de etc.)
    const intlResponse = intlMiddleware(req)

    // Wenn next-intl schon eine Response liefert (redirect), gib die zurück.
    // (Rewrite/Redirect unten würde sonst mit "falschem" Pfad arbeiten)
    if (intlResponse && intlResponse.headers.get("location")) {
        return intlResponse
    }

    // 2) Jetzt Alias-Handling: Wir nehmen an, Locale ist erstes Segment: "/de/..."
    const segments = pathname.split("/").filter(Boolean) // ["de","compliance-checker"]
    if (segments.length < 2) return intlResponse

    const locale = segments[0]
    const slug = segments[1]

    // A) Redirect camelCase URL -> kebab-case URL (SEO canonical)
    const kebab = CAMEL_TO_KEBAB[slug]
    if (kebab) {
        const url = req.nextUrl.clone()
        segments[1] = kebab
        url.pathname = "/" + segments.join("/")
        return NextResponse.redirect(url, 308)
    }

    // B) Rewrite kebab-case URL -> camelCase Ordnerroute
    const camel = KEBAB_TO_CAMEL[slug]
    if (camel) {
        const url = req.nextUrl.clone()
        segments[1] = camel
        url.pathname = "/" + segments.join("/")
        return NextResponse.rewrite(url)
    }

    return intlResponse
}

export const config = {
    matcher: [
        '/((?!api|_next|_vercel|.*\\..*|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image|icon|apple-icon).*)'
    ]
};