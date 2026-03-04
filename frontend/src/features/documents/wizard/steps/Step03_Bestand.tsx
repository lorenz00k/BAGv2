"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, TextareaInput, RadioGroup, HintBox, WizardNav,
} from "../components/WizardShell"

export function Step03_Bestand() {
    const { data, setBestand } = useWizardStore()
    const d = data.bestand

    return (
        <StepWrapper
            title="Bestehende Anlage (aktueller Zustand)"
            subtitle="Dieser Schritt ist nur bei Änderungen einer bestehenden Genehmigung auszufüllen."
            section="§ 1.2"
        >
            <div className="space-y-6">
                <HintBox>
                    Beschreiben Sie den <strong>genehmigten Bestand</strong> so, wie er <em>vor</em> der
                    beantragten Änderung existiert. Die Behörde vergleicht Bestand und Vorhaben, um den
                    Umfang der Änderung beurteilen zu können.
                </HintBox>

                <TextareaInput
                    label="Beschreibung der bestehenden Räume / Anlagenbereiche"
                    required
                    rows={6}
                    placeholder={
                        "Beispiel:\n" +
                        "EG: Werkstatt (60 m²), Lager (15 m²)\n" +
                        "(entspricht dem genehmigten Bestand laut Bescheid vom …)"
                    }
                    hint="Beziehen Sie sich auf den zuletzt gültigen Genehmigungsbescheid."
                    value={d.flaechenbeschreibungBestand}
                    onChange={e => setBestand({ flaechenbeschreibungBestand: e.target.value })}
                />

                <TextInput
                    label="Gesamtnutzfläche Bestand (m²)"
                    type="number"
                    placeholder="z.B. 200"
                    value={d.gesamtflaecheQmBestand}
                    onChange={e => setBestand({ gesamtflaecheQmBestand: e.target.value })}
                />

                <RadioGroup
                    label="Elektrische Anschlussleistung (Bestand)"
                    required
                    options={[
                        { value: "keineMaschinen", label: "Keine Maschinen" },
                        { value: "unter300", label: "Unter 300 kW" },
                        { value: "ueber300", label: "300 kW oder mehr" },
                    ]}
                    value={d.elektrischeAnschlussleistungBestand}
                    onChange={v => setBestand({
                        elektrischeAnschlussleistungBestand: v as "unter300" | "ueber300" | "keineMaschinen"
                    })}
                />
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
