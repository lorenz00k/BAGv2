"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, CheckboxField, RadioGroup, FieldDivider, HintBox, WizardNav,
} from "../components/WizardShell"

export function Step08_Wasserversorgung() {
    const { data, setWasserversorgung } = useWizardStore()
    const d = data.wasserversorgung

    const hasBrunnen = d.eigenerBrunnenTrinkwasser || d.eigenerBrunnenNutzwasser || d.eigenerBrunnenThermisch
    const hasOeffentlich = d.oeffentlicheWasserleitung || d.wassergenossenschaft || d.sonstige || d.privateWasserleitung

    return (
        <StepWrapper
            title="Wasserversorgung"
            subtitle="Wie wird die Anlage mit Wasser versorgt?"
            section="§ 5.1"
        >
            <div className="space-y-6">
                <HintBox>
                    Mehrfachauswahl ist möglich. Geben Sie alle genutzten Versorgungsquellen an.
                    Bei eigenem Brunnen oder Quellfassung ist in der Regel eine wasserrechtliche Bewilligung
                    erforderlich.
                </HintBox>

                <FieldDivider label="Öffentliche / kollektive Versorgung" />

                <div className="space-y-3">
                    <CheckboxField
                        label="Öffentliche Wasserleitung"
                        checked={d.oeffentlicheWasserleitung}
                        onChange={v => setWasserversorgung({ oeffentlicheWasserleitung: v })}
                    />
                    {d.oeffentlicheWasserleitung && (
                        <TextInput
                            label="Wasserversorger / Gemeinde"
                            placeholder="z.B. Wien Wasser"
                            value={d.oeffentlicheGemeinde}
                            onChange={e => setWasserversorgung({ oeffentlicheGemeinde: e.target.value })}
                            className="ml-8"
                        />
                    )}

                    <CheckboxField
                        label="Wassergenossenschaft"
                        checked={d.wassergenossenschaft}
                        onChange={v => setWasserversorgung({ wassergenossenschaft: v })}
                    />

                    <CheckboxField
                        label="Sonstige Fremdversorgung"
                        checked={d.sonstige}
                        onChange={v => setWasserversorgung({ sonstige: v })}
                    />

                    <CheckboxField
                        label="Private Wasserleitung"
                        checked={d.privateWasserleitung}
                        onChange={v => setWasserversorgung({ privateWasserleitung: v })}
                    />

                    {hasOeffentlich && (
                        <RadioGroup
                            label="Wasserrechtliche Bewilligung liegt vor"
                            className="ml-8"
                            options={[
                                { value: "ja", label: "Ja" },
                                { value: "nein", label: "Nein / noch nicht" },
                            ]}
                            value={d.wasserrechtBewilligungLiegtVor}
                            onChange={v => setWasserversorgung({ wasserrechtBewilligungLiegtVor: v as "" | "ja" | "nein" })}
                        />
                    )}
                </div>

                <FieldDivider label="Eigener Brunnen / Quellfassung" />

                <div className="space-y-3">
                    <CheckboxField
                        label="Eigener Brunnen – Trinkwasser"
                        checked={d.eigenerBrunnenTrinkwasser}
                        onChange={v => setWasserversorgung({ eigenerBrunnenTrinkwasser: v })}
                    />
                    <CheckboxField
                        label="Eigener Brunnen – Nutzwasser"
                        checked={d.eigenerBrunnenNutzwasser}
                        onChange={v => setWasserversorgung({ eigenerBrunnenNutzwasser: v })}
                    />
                    <CheckboxField
                        label="Eigener Brunnen – Thermische Nutzung (Wärmepumpe)"
                        checked={d.eigenerBrunnenThermisch}
                        onChange={v => setWasserversorgung({ eigenerBrunnenThermisch: v })}
                    />

                    {hasBrunnen && (
                        <RadioGroup
                            label="Wasserrechtliche Bewilligung für Brunnen"
                            className="ml-8"
                            options={[
                                { value: "ja", label: "Ja – liegt vor" },
                                { value: "nein", label: "Nein – wird gesondert beantragt" },
                            ]}
                            value={d.brunnenWasserrechtBewilligung}
                            onChange={v => setWasserversorgung({ brunnenWasserrechtBewilligung: v as "" | "ja" | "nein" })}
                        />
                    )}
                </div>
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
