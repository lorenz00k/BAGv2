"use client"

import React, { useState } from "react"
import { CheckCircle2, Download, RotateCcw, ChevronRight } from "lucide-react"
import { useWizardStore, STEP_LABELS } from "../store/wizardStore"
import { StepWrapper } from "../components/WizardShell"
import { Button } from "@/components/ui/Button"
import type { WizardStepId } from "../types/wizard.types"

// ─── Summary row ──────────────────────────────────────────────────────────────

function SummarySection({
    stepId,
    lines,
    onEdit,
}: {
    stepId: WizardStepId
    lines: string[]
    onEdit: () => void
}) {
    return (
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-[var(--color-border)]">
                <span className="text-sm font-semibold text-slate-700">{STEP_LABELS[stepId]}</span>
                <button
                    type="button"
                    onClick={onEdit}
                    className="text-xs text-[var(--color-accent)] hover:underline"
                >
                    Bearbeiten
                </button>
            </div>
            <ul className="px-4 py-3 space-y-1">
                {lines.filter(Boolean).length === 0 ? (
                    <li className="text-sm text-slate-400 italic">Keine Angaben</li>
                ) : (
                    lines.filter(Boolean).map((line, i) => (
                        <li key={i} className="text-sm text-slate-600 leading-5">{line}</li>
                    ))
                )}
            </ul>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step14_Zusammenfassung() {
    const { data, getActiveSteps, goToStep, reset } = useWizardStore()
    const [isGenerating, setIsGenerating] = useState(false)
    const d = data

    const activeSteps = getActiveSteps()
    const showBestand = activeSteps.includes("bestand")

    // ── Build summary lines per section ───────────────────────────────────────
    const sections: { stepId: WizardStepId; lines: (string | false | undefined)[] }[] = [
        {
            stepId: "grunddaten",
            lines: [
                d.grunddaten.antragstellerName && `Antragsteller: ${d.grunddaten.antragstellerName}`,
                d.grunddaten.artDerAnlage && `Anlage: ${d.grunddaten.artDerAnlage}`,
                (d.grunddaten.strasse || d.grunddaten.hausnummer)
                    && `Adresse: ${d.grunddaten.strasse} ${d.grunddaten.hausnummer}, ${d.grunddaten.bezirk}. Bezirk`,
                `Vorhaben: ${d.grunddaten.vorhabenTyp === "aenderung" ? "Änderung" : "Neugenehmigung"}`,
            ],
        },
        {
            stepId: "vorhaben",
            lines: [
                d.vorhaben.gesamtflaecheQm && `Gesamtfläche: ${d.vorhaben.gesamtflaecheQm} m²`,
                d.vorhaben.elektrischeAnschlussleistung === "keineMaschinen"
                    ? "Keine Maschinen"
                    : d.vorhaben.elektrischeAnschlussleistung === "unter300"
                        ? "Elektrische Anschlussleistung: < 300 kW"
                        : "Elektrische Anschlussleistung: ≥ 300 kW",
            ],
        },
        ...(showBestand ? [{
            stepId: "bestand" as WizardStepId,
            lines: [
                d.bestand.gesamtflaecheQmBestand && `Bestandsfläche: ${d.bestand.gesamtflaecheQmBestand} m²`,
            ],
        }] : []),
        {
            stepId: "betriebsablauf",
            lines: [
                d.betriebsablauf.alsAnlageBeigelegt
                    ? "Betriebsbeschreibung liegt als Beilage bei"
                    : d.betriebsablauf.beschreibung
                        ? `${d.betriebsablauf.beschreibung.slice(0, 120)}${d.betriebsablauf.beschreibung.length > 120 ? "…" : ""}`
                        : "",
            ],
        },
        {
            stepId: "betriebszeiten",
            lines: [
                d.betriebszeiten.beantragteZeiten
                    ? `${d.betriebszeiten.beantragteZeiten.slice(0, 120)}`
                    : "",
            ],
        },
        {
            stepId: "mitarbeiter",
            lines: [
                d.mitarbeiter.keineArbeitnehmer
                    ? "Keine Arbeitnehmer"
                    : [
                        d.mitarbeiter.anzahlMaennlich && `${d.mitarbeiter.anzahlMaennlich} männlich`,
                        d.mitarbeiter.anzahlWeiblich && `${d.mitarbeiter.anzahlWeiblich} weiblich`,
                    ].filter(Boolean).join(", "),
            ],
        },
        {
            stepId: "arbeitsraeume",
            lines: [
                `${d.arbeitsraeume.rows.length} Raum/Räume eingetragen`,
                ...d.arbeitsraeume.rows.slice(0, 3).map(r => r.bezeichnung && `• ${r.bezeichnung}: ${r.flaecheQm} m²`),
            ],
        },
        {
            stepId: "wasserversorgung",
            lines: [
                d.wasserversorgung.oeffentlicheWasserleitung && "Öffentliche Wasserleitung",
                d.wasserversorgung.wassergenossenschaft && "Wassergenossenschaft",
                d.wasserversorgung.eigenerBrunnenTrinkwasser && "Brunnen (Trinkwasser)",
                d.wasserversorgung.eigenerBrunnenNutzwasser && "Brunnen (Nutzwasser)",
            ],
        },
        {
            stepId: "abwasser",
            lines: [
                d.abwasser.kanal && "Ableitung: Öffentlicher Kanal",
                d.abwasser.vorfluter && "Ableitung: Vorfluter",
                d.abwasser.senkgrube && `Senkgrube: ${d.abwasser.senkgrubeVolumen} m³`,
            ],
        },
        {
            stepId: "stromversorgung",
            lines: [
                d.stromversorgung.oeffentlichNeu && "Öffentliches Netz: Neu",
                d.stromversorgung.oeffentlichUnveraendert && "Öffentliches Netz: Unverändert",
                d.stromversorgung.eigenanlageArt && `Eigenanlage: ${d.stromversorgung.eigenanlageArt}`,
                d.stromversorgung.notstromArt && `Notstrom: ${d.stromversorgung.notstromArt}`,
            ],
        },
        {
            stepId: "brandschutz",
            lines: [
                d.brandschutz.keinGeplant
                    ? "Keine aktive Brandschutzanlage"
                    : [
                        d.brandschutz.sprinkleranlage && "Sprinkler",
                        d.brandschutz.brandmeldeanlage && "BMA",
                        d.brandschutz.rauchWaermeabzug && "RWA",
                    ].filter(Boolean).join(", "),
                `${d.brandschutz.brandabschnitte.length} Brandabschnitt/e`,
            ],
        },
        {
            stepId: "teaser",
            lines: [
                [
                    d.teaser.maschinen && "Maschinen",
                    d.teaser.stoffe && "Gefährl. Stoffe",
                    d.teaser.heizung && "Heizanlage",
                    d.teaser.kaelteKlima && "Kälte/Klima",
                    d.teaser.lueftung && "Lüftung",
                    d.teaser.gasLagerung && "Gaslagerung",
                    d.teaser.laerm && "Lärmquellen",
                ].filter(Boolean).join(", ") || "Keine weiteren Anlagen",
            ],
        },
    ]

    // ── PDF Download ───────────────────────────────────────────────────────────
    async function handleDownload() {
        setIsGenerating(true)
        try {
            const { generateBetriebsbeschreibungPdf } = await import("../pdf/generatePdf")
            await generateBetriebsbeschreibungPdf(data)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <StepWrapper
            title="Zusammenfassung & PDF-Download"
            subtitle="Prüfen Sie Ihre Angaben und laden Sie die fertige Betriebsbeschreibung herunter."
        >
            <div className="space-y-4">
                {/* Success banner */}
                <div className="rounded-[var(--radius-sm)] bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-emerald-800">Alle Pflichtfelder ausgefüllt!</p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                            Das PDF enthält Ihre Betriebsbeschreibung im Format des Formular 005-2 der MA 36.
                        </p>
                    </div>
                </div>

                {/* Section cards */}
                <div className="space-y-3">
                    {sections.map(s => (
                        <SummarySection
                            key={s.stepId}
                            stepId={s.stepId}
                            lines={s.lines.filter((l): l is string => Boolean(l))}
                            onEdit={() => goToStep(s.stepId)}
                        />
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        variant="primary"
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex-1 justify-center"
                    >
                        <Download className="w-4 h-4" aria-hidden />
                        {isGenerating ? "PDF wird erstellt…" : "Betriebsbeschreibung herunterladen"}
                    </Button>
                </div>

                {/* Reset */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm("Alle Eingaben zurücksetzen? Dieser Schritt kann nicht rückgängig gemacht werden.")) {
                                reset()
                            }
                        }}
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Formular zurücksetzen
                    </button>
                </div>
            </div>
        </StepWrapper>
    )
}
