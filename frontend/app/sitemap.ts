//Liste aller URLs der Seite für Suchmaschinen 

import type { MetadataRoute } from "next"
import { locales } from "@/i18n/locales"
import { ROUTES } from "@/navigation/routes"

const base =
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://betriebsanlage-check.at").replace(
        /\/$/,
        ""
    )


// Whitelist: nur diese Routen kommen in die Sitemap
const PUBLIC_KEYS = [
    "home",
    "complianceChecker",
    "gastroAi",
    "addressChecker",
    "faq",
    "imprint",
    "privacy",
] as const

const last = process.env.NEXT_PUBLIC_BUILD_TIME
    ? new Date(process.env.NEXT_PUBLIC_BUILD_TIME)
    : new Date()


type PublicKey = (typeof PUBLIC_KEYS)[number]

export default function sitemap(): MetadataRoute.Sitemap {

    const routes = PUBLIC_KEYS.map((k: PublicKey) => ROUTES[k])

    return locales.flatMap((l) =>
        routes.map((r) => ({
            url: `${base}/${l}${r}`, // r ist "" oder "/faq" etc.
            lastModified: last,

            // grobe Defaults – kannst du gerne anpassen
            changeFrequency: r === "" || r === "/faq" ? "weekly" : "monthly",
            priority:
                r === "" ? 1.0 :
                    r === ROUTES.complianceChecker ? 0.9 :
                        r === ROUTES.faq ? 0.8 :
                            0.7,
        }))
    )
}