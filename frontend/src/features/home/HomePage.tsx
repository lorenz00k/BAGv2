"use client"

import { Container } from "@/components/layout/Container"
import Hero from "./components/Hero"
import SellingPoints from "./components/SellingPoints"
import { Section } from "@/components/layout/Section"
import DocumentTeaser from "./components/DocumentTeaser"
import { SectionSeparator } from "@/components/layout/SectionSeperator"


export default function HomePage({ locale }: { locale: string }) {
    return (
        <>
            <Hero locale={locale} />
            {/* später: Feature cards / sections */}

            <SellingPoints />
            <SectionSeparator />
            <DocumentTeaser locale={locale} />

        </>
    )
}
