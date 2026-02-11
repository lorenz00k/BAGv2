"use client"

import Hero from "./components/Hero"
import SellingPoints from "./components/SellingPoints"


export default function HomePage({ locale }: { locale: string }) {
    return (
        <>
            <Hero locale={locale} />
            {/* später: Feature cards / sections */}
            <SellingPoints locale={locale} />
        </>
    )
}
