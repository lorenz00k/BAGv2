"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, TextareaInput, RadioGroup, HintBox, WizardNav,
} from "../components/WizardShell"

export function Step02_Vorhaben() {
    const { data, setVorhaben } = useWizardStore()
    const d = data.vorhaben

    return (
        <StepWrapper
            title="Geplantes Vorhaben"
            subtitle="Beschreibung der Räume und technischen Ausstattung."
            section="§ 1.1"
        >
            <div className="space-y-6">
                <HintBox>
                    Beschreiben Sie die geplanten Räume, ihre Nutzung und die Gesamtfläche. Bei Änderungen
                    sind nur die <strong>neuen oder geänderten</strong> Teile einzutragen.
                </HintBox>

                <TextareaInput
                    label="Beschreibung der Räume / Anlagenbereiche"
                    required
                    rows={6}
                    placeholder={
                        "Beispiel:\n" +
                        "EG: Werkstatt (80 m²), Lager (20 m²)\n" +
                        "OG: Büro (25 m²), Sozialraum (15 m²)"
                    }
                    hint="Benennen Sie jeden Raum, seine Funktion und – wo bekannt – seine Fläche."
                    value={d.flaechenbeschreibung}
                    onChange={e => setVorhaben({ flaechenbeschreibung: e.target.value })}
                />

                <TextInput
                    label="Gesamtnutzfläche (m²)"
                    type="number"
                    placeholder="z.B. 350"
                    value={d.gesamtflaecheQm}
                    onChange={e => setVorhaben({ gesamtflaecheQm: e.target.value })}
                />

                <RadioGroup
                    label="Elektrische Anschlussleistung aller Maschinen zusammen"
                    required
                    hint="Summieren Sie die Nennleistungen aller motor- oder elektrisch betriebenen Geräte (ohne Beleuchtung und Heizung)."
                    options={[
                        { value: "keineMaschinen", label: "Keine Maschinen / kein Maschineneinsatz" },
                        { value: "unter300", label: "Unter 300 kW Gesamtanschlussleistung" },
                        { value: "ueber300", label: "300 kW oder mehr (Beilagen erforderlich)" },
                    ]}
                    value={d.elektrischeAnschlussleistung}
                    onChange={v => setVorhaben({
                        elektrischeAnschlussleistung: v as "unter300" | "ueber300" | "keineMaschinen"
                    })}
                />
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
