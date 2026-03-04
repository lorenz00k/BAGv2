"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, CheckboxField, RadioGroup, FieldDivider, HintBox, WizardNav,
} from "../components/WizardShell"

export function Step11_Stromversorgung() {
    const { data, setStromversorgung } = useWizardStore()
    const d = data.stromversorgung

    return (
        <StepWrapper
            title="Stromversorgung"
            subtitle="Wie wird die Anlage mit elektrischer Energie versorgt?"
            section="§ 5.4"
        >
            <div className="space-y-6">
                <HintBox>
                    Wenn Sie ausschließlich über das öffentliche Netz versorgt werden und sich daran
                    nichts ändert, genügt ein Haken bei „Unverändert". Bei eigenen Anlagen (PV, Notstrom)
                    sind Typ und Leistung einzutragen.
                </HintBox>

                <FieldDivider label="Öffentliches Netz (EVU)" />

                <div className="space-y-3">
                    <CheckboxField
                        label="Neu angeschlossen"
                        checked={d.oeffentlichNeu}
                        onChange={v => setStromversorgung({ oeffentlichNeu: v })}
                    />
                    <CheckboxField
                        label="Unverändert bestehend"
                        checked={d.oeffentlichUnveraendert}
                        onChange={v => setStromversorgung({ oeffentlichUnveraendert: v })}
                    />
                    <CheckboxField
                        label="Änderung des Anschlusses"
                        checked={d.oeffentlichAenderungAnschluss}
                        onChange={v => setStromversorgung({ oeffentlichAenderungAnschluss: v })}
                    />
                </div>

                <FieldDivider label="Eigene Anlage (PV, BHKW, etc.)" />

                <div className="space-y-4">
                    <TextInput
                        label="Art der Eigenanlage"
                        placeholder="z.B. Photovoltaik 10 kWp, BHKW 20 kW"
                        value={d.eigenanlageArt}
                        onChange={e => setStromversorgung({ eigenanlageArt: e.target.value })}
                    />
                    <div className="flex gap-6">
                        <CheckboxField
                            label="Neu"
                            checked={d.eigenanlageNeu}
                            onChange={v => setStromversorgung({ eigenanlageNeu: v })}
                        />
                        <CheckboxField
                            label="Unverändert"
                            checked={d.eigenanlageUnveraendert}
                            onChange={v => setStromversorgung({ eigenanlageUnveraendert: v })}
                        />
                    </div>
                </div>

                <FieldDivider label="Notstromanlage" />

                <div className="space-y-4">
                    <TextInput
                        label="Art der Notstromanlage"
                        placeholder="z.B. Diesel-Notstromaggregat 50 kVA"
                        value={d.notstromArt}
                        onChange={e => setStromversorgung({ notstromArt: e.target.value })}
                    />
                    <div className="flex gap-6">
                        <CheckboxField
                            label="Neu"
                            checked={d.notstromNeu}
                            onChange={v => setStromversorgung({ notstromNeu: v })}
                        />
                        <CheckboxField
                            label="Unverändert"
                            checked={d.notstromUnveraendert}
                            onChange={v => setStromversorgung({ notstromUnveraendert: v })}
                        />
                    </div>
                </div>

                <FieldDivider label="Hochspannungsleitungen" />

                <RadioGroup
                    label="Verläuft eine Hochspannungsleitung über das Betriebsgelände oder in dessen Nähe?"
                    options={[
                        { value: "nein", label: "Nein" },
                        { value: "ja", label: "Ja" },
                    ]}
                    value={d.hochspannungsleitung}
                    onChange={v => setStromversorgung({ hochspannungsleitung: v as "" | "nein" | "ja" })}
                />

                {d.hochspannungsleitung === "ja" && (
                    <div className="ml-8 grid grid-cols-2 gap-4">
                        <TextInput
                            label="Leitungsträger"
                            placeholder="z.B. Wiener Netze"
                            value={d.hochspannungstraeger}
                            onChange={e => setStromversorgung({ hochspannungstraeger: e.target.value })}
                        />
                        <TextInput
                            label="Mindestabstand (m)"
                            type="number"
                            placeholder="5"
                            value={d.hochspannungAbstand}
                            onChange={e => setStromversorgung({ hochspannungAbstand: e.target.value })}
                        />
                    </div>
                )}
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
