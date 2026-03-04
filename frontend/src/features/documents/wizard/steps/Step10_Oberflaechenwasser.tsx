"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, CheckboxField, FieldDivider, HintBox, WizardNav,
} from "../components/WizardShell"
import type { OberflaechenwasserData } from "../types/wizard.types"

type BN = "" | "bestand" | "neu"

function BNSelect({
    label,
    value,
    onChange,
}: {
    label: string
    value: BN
    onChange: (v: BN) => void
}) {
    return (
        <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[var(--color-border)] last:border-0">
            <span className="text-sm text-slate-700 flex-1">{label}</span>
            <div className="flex gap-3 flex-shrink-0">
                {(["bestand", "neu", ""] as BN[]).map(opt => {
                    const lbl = opt === "bestand" ? "Bestand" : opt === "neu" ? "Neu" : "–"
                    return (
                        <label key={opt} className="flex items-center gap-1 cursor-pointer text-xs text-slate-600">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 grid place-items-center transition-colors ${
                                value === opt
                                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                                    : "border-slate-300"
                            }`}>
                                {value === opt && <div className="w-1 h-1 rounded-full bg-white" />}
                            </div>
                            <input type="radio" className="sr-only" checked={value === opt} onChange={() => onChange(opt)} />
                            {lbl}
                        </label>
                    )
                })}
            </div>
        </div>
    )
}

export function Step10_Oberflaechenwasser() {
    const { data, setOberflaechenwasser } = useWizardStore()
    const d = data.oberflaechenwasser
    const set = (v: Partial<OberflaechenwasserData>) => setOberflaechenwasser(v)

    return (
        <StepWrapper
            title="Oberflächenwasserbeseitigung"
            subtitle="Wohin wird Regen- und Schmelzwasser von Dach-, Verkehrs- und Lagerflächen geleitet?"
            section="§ 5.3"
        >
            <div className="space-y-6">
                <HintBox>
                    Wählen Sie für jede Methode: ist sie im <strong>Bestand</strong> vorhanden oder wird sie
                    <strong> neu</strong> errichtet? Nicht zutreffende Felder lassen Sie auf „–".
                </HintBox>

                <FieldDivider label="Dachflächen" />
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
                    <BNSelect label="Sickerschacht" value={d.dachSickerschacht} onChange={v => set({ dachSickerschacht: v })} />
                    <BNSelect label="Versickerung über Rasenfläche" value={d.dachVersickerungRasen} onChange={v => set({ dachVersickerungRasen: v })} />
                    <BNSelect label="Öffentlicher Kanal" value={d.dachOeffentlicherKanal} onChange={v => set({ dachOeffentlicherKanal: v })} />
                    <BNSelect label="Vorfluter (Gewässer)" value={d.dachVorfluter} onChange={v => set({ dachVorfluter: v })} />
                </div>

                <FieldDivider label="Verkehrsflächen (Parkplatz, Zufahrt)" />
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
                    <BNSelect label="Versickerung Rasenfläche" value={d.verkehrVersickerungRasen} onChange={v => set({ verkehrVersickerungRasen: v })} />
                    <BNSelect label="Versickerung Rasenmulde" value={d.verkehrVersickerungRasenmulde} onChange={v => set({ verkehrVersickerungRasenmulde: v })} />
                    <BNSelect label="Öffentlicher Kanal" value={d.verkehrOeffentlicherKanal} onChange={v => set({ verkehrOeffentlicherKanal: v })} />
                    <BNSelect label="Vorfluter" value={d.verkehrVorfluter} onChange={v => set({ verkehrVorfluter: v })} />
                </div>

                <FieldDivider label="Lager- und Freiflächen" />
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
                    <BNSelect label="Versickerung Rasenfläche" value={d.lagerVersickerungRasen} onChange={v => set({ lagerVersickerungRasen: v })} />
                    <BNSelect label="Versickerung Rasenmulde" value={d.lagerVersickerungRasenmulde} onChange={v => set({ lagerVersickerungRasenmulde: v })} />
                    <BNSelect label="Öffentlicher Kanal" value={d.lagerOeffentlicherKanal} onChange={v => set({ lagerOeffentlicherKanal: v })} />
                    <BNSelect label="Vorfluter" value={d.lagerVorfluter} onChange={v => set({ lagerVorfluter: v })} />
                    <BNSelect label="Sonstiges" value={d.sonstige} onChange={v => set({ sonstige: v })} />
                </div>

                <CheckboxField
                    label="Detailprojekt liegt als Beilage bei"
                    checked={d.detailprojektLiegtBei}
                    onChange={v => set({ detailprojektLiegtBei: v })}
                />
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
