"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextareaInput, CheckboxField, HintBox, WizardNav,
} from "../components/WizardShell"

export function Step04_Betriebsablauf() {
    const { data, setBetriebsablauf } = useWizardStore()
    const d = data.betriebsablauf

    return (
        <StepWrapper
            title="Betriebsablauf & Produktionsprozesse"
            subtitle="Wie läuft der Betrieb ab? Was wird produziert oder angeboten?"
            section="§ 2"
        >
            <div className="space-y-6">
                <HintBox>
                    Schildern Sie den typischen Tagesablauf: Was passiert wo, mit welchen Mitteln? Gehen Sie
                    auf <strong>Lärm-, Staub-, Geruchs- oder Gefahrenquellen</strong> ein, falls vorhanden.
                    Je konkreter die Beschreibung, desto reibungsloser das Genehmigungsverfahren.
                </HintBox>

                <CheckboxField
                    label="Betriebsbeschreibung liegt als gesondertes Dokument bei"
                    hint="Wenn Sie eine ausführliche Betriebsbeschreibung als Anhang einreichen, können Sie das Textfeld leer lassen."
                    checked={d.alsAnlageBeigelegt}
                    onChange={v => setBetriebsablauf({ alsAnlageBeigelegt: v })}
                />

                {!d.alsAnlageBeigelegt && (
                    <TextareaInput
                        label="Beschreibung des Betriebsablaufs"
                        required={!d.alsAnlageBeigelegt}
                        rows={10}
                        placeholder={
                            "Beispiel:\n\n" +
                            "Montag–Freitag, 07:00–18:00 Uhr:\n" +
                            "Anlieferung von Rohmaterial per LKW (max. 2×/Tag). Verarbeitung in der\n" +
                            "Werkstatt (EG). Fertigprodukte werden im Lager (EG) zwischengelagert.\n" +
                            "Im Büro (OG) erfolgt die Auftragsabwicklung.\n\n" +
                            "Eingesetzte Maschinen: Kreissäge (3,5 kW), Hobelmaschine (2,2 kW).\n" +
                            "Lärmpegel wird durch Kapselung minimiert."
                        }
                        value={d.beschreibung}
                        onChange={e => setBetriebsablauf({ beschreibung: e.target.value })}
                    />
                )}
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
