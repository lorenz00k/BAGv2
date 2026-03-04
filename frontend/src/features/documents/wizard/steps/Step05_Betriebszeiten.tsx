"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, TextareaInput, CheckboxField, HintBox, WizardNav,
} from "../components/WizardShell"

export function Step05_Betriebszeiten() {
    const { data, setBetriebszeiten } = useWizardStore()
    const d = data.betriebszeiten
    const isAenderung = data.grunddaten.vorhabenTyp === "aenderung"

    return (
        <StepWrapper
            title="Betriebszeiten"
            subtitle="Welche Öffnungs- und Betriebszeiten werden beantragt?"
            section="§ 3"
        >
            <div className="space-y-6">
                <HintBox>
                    Geben Sie alle geplanten Betriebszeiten an – auch Lieferzeiten, Nachtbetrieb oder
                    Wochenendarbeit. Die Behörde prüft insbesondere den Lärmschutz für die Nachbarschaft.
                </HintBox>

                <TextareaInput
                    label="Beantragte Betriebszeiten"
                    required
                    rows={4}
                    placeholder={
                        "Beispiel:\nMo–Fr: 07:00–19:00 Uhr\nSa: 08:00–14:00 Uhr\nSo/Feiertag: geschlossen\n\n" +
                        "Lieferzeiten: Mo–Fr 07:00–09:00 Uhr"
                    }
                    value={d.beantragteZeiten}
                    onChange={e => setBetriebszeiten({ beantragteZeiten: e.target.value })}
                />

                {isAenderung && (
                    <>
                        <CheckboxField
                            label="Keine Änderung der genehmigten Betriebszeiten"
                            hint="Wenn sich die Betriebszeiten nicht ändern, setzen Sie diesen Haken und lassen Sie die Felder unten leer."
                            checked={d.keinAenderungDerGenehmigtenZeiten}
                            onChange={v => setBetriebszeiten({ keinAenderungDerGenehmigtenZeiten: v })}
                        />

                        {!d.keinAenderungDerGenehmigtenZeiten && (
                            <>
                                <TextareaInput
                                    label="Genehmigte Betriebszeiten (laut Bescheid)"
                                    rows={4}
                                    placeholder="Bisherige genehmigte Zeiten eintragen"
                                    value={d.genehmigteZeiten}
                                    onChange={e => setBetriebszeiten({ genehmigteZeiten: e.target.value })}
                                />
                                <TextInput
                                    label="Bescheid-Zahl und -Datum"
                                    placeholder="z.B. MA 36 – 123/2019, 15.03.2019"
                                    value={d.bescheidZahlDatum}
                                    onChange={e => setBetriebszeiten({ bescheidZahlDatum: e.target.value })}
                                />
                            </>
                        )}
                    </>
                )}
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
