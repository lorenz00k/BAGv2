"use client"

import Hero from "./components/Hero"


export default function HomePage({ locale }: { locale: string }) {
    return (
        <>
            <Hero locale={locale} />
            {/* später: Feature cards / sections */}
        </>
    )
}
