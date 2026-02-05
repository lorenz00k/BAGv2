// definieren von globalen metadaten

import "@/styles/globals.css"
import { ICONS } from "@/seo/icons"
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from "next/script"

export const metadata = {
    icons: {
        icon: [ICONS.svg, ICONS.png192, ICONS.png512],
        apple: [ICONS.apple180],
        shortcut: [ICONS.ico],
    },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head>
                <Script id="ga-consent-default" strategy="beforeInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('consent', 'default', {
                        'ad_storage': 'denied',
                        'analytics_storage': 'denied',
                        'ad_user_data': 'denied',
                        'ad_personalization': 'denied'
                        });
          `         }
                </Script>
            </head>
            <body>
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
