import createMiddleware from "next-intl/middleware";
import { locales } from "@/i18n/locales";

export default createMiddleware({
    locales,
    defaultLocale: 'de',
    localePrefix: 'as-needed'
});

export const config = {
    matcher: [
        '/((?!api|_next|_vercel|.*\\..*|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image|icon|apple-icon).*)'
    ]
};