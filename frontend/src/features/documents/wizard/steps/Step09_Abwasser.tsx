"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, TextareaInput, CheckboxField, RadioGroup,
    FieldDivider, HintBox, WizardNav,
} from "../components/WizardShell"

type BestandNeu = "" | "bestand" | "neu"
const BESTAND_NEU_OPTS = [
    { value: "bestand", label: "Bestand (vorhanden)" },
    { value: "neu", label: "Neu (geplant)" },
]

function AbscheiderField({
    label,
    value,
    onChange,
}: {
    label: string
    value: BestandNeu
    onChange: (v: BestandNeu) => void
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--color-border)] last:border-0">
            <span className="text-sm text-slate-700">{label}</span>
            <div className="flex gap-4">
                {BESTAND_NEU_OPTS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-600">
                        <div className={`w-4 h-4 rounded-full border-2 grid place-items-center transition-colors ${
                            value === opt.value
                                ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                                : "border-slate-300"
                        }`}>
                            {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <input
                            type="radio"
                            className="sr-only"
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value as BestandNeu)}
                        />
                        {opt.label}
                    </label>
                ))}
                <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-400">
                    <div className={`w-4 h-4 rounded-full border-2 grid place-items-center transition-colors ${
                        value === "" ? "border-[var(--color-accent)] bg-[var(--color-accent)]" : "border-slate-300"
                    }`}>
                        {value === "" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <input type="radio" className="sr-only" checked={value === ""} onChange={() => onChange("")} />
                    Nicht vorhanden
                </label>
            </div>
        </div>
    )
}

export function Step09_Abwasser() {
    const { data, setAbwasser } = useWizardStore()
    const d = data.abwasser

    return (
        <StepWrapper
            title="Betriebliche Abwasserbeseitigung"
            subtitle="Wohin wird das Abwasser abgeleitet? Welche Vorbehandlungsanlagen gibt es?"
            section="§ 5.2"
        >
            <div className="space-y-6">
                <HintBox>
                    Betriebliche Abwässer (z.B. aus Produktion, Reinigung) müssen separat von
                    Sanitärabwässern behandelt werden, wenn sie Schadstoffe enthalten. Die Behörde
                    prüft, ob eine Vorbehandlung notwendig ist.
                </HintBox>

                <TextareaInput
                    label="Herkunftsbereiche des Abwassers"
                    rows={3}
                    placeholder="z.B. Waschplatz, Küchenbereich, Produktionshalle"
                    value={d.herkunftsbereiche}
                    onChange={e => setAbwasser({ herkunftsbereiche: e.target.value })}
                />

                <FieldDivider label="Ableitung" />

                <div className="space-y-3">
                    <CheckboxField
                        label="Öffentlicher Kanal"
                        checked={d.kanal}
                        onChange={v => setAbwasser({ kanal: v })}
                    />
                    {d.kanal && (
                        <TextInput
                            label="Kanalanschluss-Bestätigung vom (Datum)"
                            placeholder="TT.MM.JJJJ"
                            value={d.kanalBestaetigungDatum}
                            onChange={e => setAbwasser({ kanalBestaetigungDatum: e.target.value })}
                            className="ml-8"
                        />
                    )}

                    <CheckboxField
                        label="Vorfluter (Gewässer)"
                        checked={d.vorfluter}
                        onChange={v => setAbwasser({ vorfluter: v })}
                    />

                    <CheckboxField
                        label="Senkgrube"
                        checked={d.senkgrube}
                        onChange={v => setAbwasser({ senkgrube: v })}
                    />
                    {d.senkgrube && (
                        <div className="ml-8 grid grid-cols-2 gap-4">
                            <TextInput
                                label="Volumen (m³)"
                                type="number"
                                placeholder="5"
                                value={d.senkgrubeVolumen}
                                onChange={e => setAbwasser({ senkgrubeVolumen: e.target.value })}
                            />
                            <TextInput
                                label="Letzte Prüfung (Datum)"
                                placeholder="TT.MM.JJJJ"
                                value={d.senkgrubeGeprueftAm}
                                onChange={e => setAbwasser({ senkgrubeGeprueftAm: e.target.value })}
                            />
                        </div>
                    )}

                    <CheckboxField
                        label="Sonstiges"
                        checked={d.sonstiges}
                        onChange={v => setAbwasser({ sonstiges: v })}
                    />
                    {d.sonstiges && (
                        <TextInput
                            label="Beschreibung"
                            placeholder="Sonstige Ableitung"
                            value={d.sonstigesText}
                            onChange={e => setAbwasser({ sonstigesText: e.target.value })}
                            className="ml-8"
                        />
                    )}
                </div>

                <FieldDivider label="Vorbehandlungsanlagen" />

                <p className="text-sm text-slate-500">
                    Für jede Anlage: ist sie vorhanden (Bestand) oder wird sie neu errichtet?
                </p>

                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
                    <AbscheiderField
                        label="Mineralölabscheider"
                        value={d.mineraloel}
                        onChange={v => setAbwasser({ mineraloel: v })}
                    />
                    <AbscheiderField
                        label="Restölabscheider"
                        value={d.restoel}
                        onChange={v => setAbwasser({ restoel: v })}
                    />
                    <AbscheiderField
                        label="Schlammfang"
                        value={d.schlammfang}
                        onChange={v => setAbwasser({ schlammfang: v })}
                    />
                    <AbscheiderField
                        label="Fettabscheider"
                        value={d.fettabscheider}
                        onChange={v => setAbwasser({ fettabscheider: v })}
                    />
                    <AbscheiderField
                        label="Sonstige Vorbehandlung"
                        value={d.sonstigeVorbehandlung}
                        onChange={v => setAbwasser({ sonstigeVorbehandlung: v })}
                    />
                </div>

                <CheckboxField
                    label="Detailprojekt für Vorbehandlungsanlagen liegt als Beilage bei"
                    checked={d.detailprojektLiegtBei}
                    onChange={v => setAbwasser({ detailprojektLiegtBei: v })}
                />
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
