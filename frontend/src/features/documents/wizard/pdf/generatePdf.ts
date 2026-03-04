/**
 * Client-side PDF generation for the Betriebsbeschreibung wizard.
 * Uses @react-pdf/renderer (already installed).
 *
 * Called lazily from Step14 so the renderer is never bundled in the initial chunk.
 */
import { createElement } from "react"
import type { WizardData } from "../types/wizard.types"

export async function generateBetriebsbeschreibungPdf(data: WizardData): Promise<void> {
    // Dynamic import keeps this out of the initial bundle
    const { pdf } = await import("@react-pdf/renderer")
    const { BetriebsbeschreibungDocument } = await import("./BetriebsbeschreibungDocument")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(createElement(BetriebsbeschreibungDocument, { data }) as any).toBlob()

    // Trigger browser download
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const name = data.grunddaten.antragstellerName
        ? `Betriebsbeschreibung_${data.grunddaten.antragstellerName.replace(/[^a-z0-9]/gi, "_")}.pdf`
        : "Betriebsbeschreibung.pdf"
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
}
