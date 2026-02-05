// definieren von globalen metadaten

import "@/styles/globals.css"
import { ICONS } from "@/seo/icons"

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
            <body>{children}</body>
        </html>
    )
}
