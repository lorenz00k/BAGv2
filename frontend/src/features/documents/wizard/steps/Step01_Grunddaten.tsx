"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, RadioGroup, FieldDivider, HintBox, WizardNav,
} from "../components/WizardShell"

export function Step01_Grunddaten() {
    const { data, setGrunddaten, goNext } = useWizardStore()
    const d = data.grunddaten

    return (
        <StepWrapper
            title="Grunddaten & Antragsteller"
            subtitle="Wer stellt den Antrag, und wo liegt die Anlage?"
        >
            <div className="space-y-6">
                <HintBox>
                    Diese Angaben erscheinen auf dem Deckblatt der Betriebsbeschreibung. Tragen Sie den
                    rechtlichen Namen des Unternehmens (oder der natürlichen Person) ein.
                </HintBox>

                <RadioGroup
                    label="Art des Vorhabens"
                    required
                    options={[
                        { value: "neugenehmigung", label: "Neugenehmigung (Betrieb wird neu genehmigt)" },
                        { value: "aenderung", label: "Änderung (bestehende Genehmigung wird geändert)" },
                    ]}
                    value={d.vorhabenTyp}
                    onChange={v => setGrunddaten({ vorhabenTyp: v as "neugenehmigung" | "aenderung" })}
                />

                <FieldDivider label="Antragsteller" />

                <TextInput
                    label="Name / Firma"
                    required
                    placeholder="z.B. Mustermann GmbH"
                    value={d.antragstellerName}
                    onChange={e => setGrunddaten({ antragstellerName: e.target.value })}
                />
                <TextInput
                    label="Anschrift des Antragstellers"
                    placeholder="Straße, PLZ, Ort"
                    value={d.antragstellerAnschrift}
                    onChange={e => setGrunddaten({ antragstellerAnschrift: e.target.value })}
                />

                <FieldDivider label="Kontaktperson (falls abweichend)" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="Name der Kontaktperson"
                        placeholder="Vor- und Nachname"
                        value={d.kontaktName}
                        onChange={e => setGrunddaten({ kontaktName: e.target.value })}
                    />
                    <TextInput
                        label="Telefon"
                        placeholder="+43 1 234 5678"
                        type="tel"
                        value={d.kontaktTelefon}
                        onChange={e => setGrunddaten({ kontaktTelefon: e.target.value })}
                    />
                </div>
                <TextInput
                    label="Anschrift der Kontaktperson"
                    placeholder="Straße, PLZ, Ort (falls abweichend)"
                    value={d.kontaktAnschrift}
                    onChange={e => setGrunddaten({ kontaktAnschrift: e.target.value })}
                />

                <FieldDivider label="Standort der Anlage" />

                <TextInput
                    label="Art der Anlage / Betriebsbezeichnung"
                    required
                    placeholder="z.B. Schreinerei, Gastgewerbe, KFZ-Werkstatt"
                    value={d.artDerAnlage}
                    onChange={e => setGrunddaten({ artDerAnlage: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="Straße"
                        placeholder="Mustergasse"
                        value={d.strasse}
                        onChange={e => setGrunddaten({ strasse: e.target.value })}
                    />
                    <TextInput
                        label="Hausnummer"
                        placeholder="1a"
                        value={d.hausnummer}
                        onChange={e => setGrunddaten({ hausnummer: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="Bezirk (1–23)"
                        placeholder="z.B. 1"
                        type="number"
                        value={d.bezirk}
                        onChange={e => setGrunddaten({ bezirk: e.target.value })}
                    />
                    <TextInput
                        label="Gemeinde"
                        placeholder="Wien"
                        value={d.gemeinde}
                        onChange={e => setGrunddaten({ gemeinde: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="Katastralgemeinde"
                        placeholder="KG-Name"
                        value={d.katastralgemeinde}
                        onChange={e => setGrunddaten({ katastralgemeinde: e.target.value })}
                    />
                    <TextInput
                        label="Grundstücksnummer"
                        placeholder="123/4"
                        value={d.grundstuecksnummer}
                        onChange={e => setGrunddaten({ grundstuecksnummer: e.target.value })}
                    />
                </div>

                <TextInput
                    label="Ausfülldatum"
                    type="date"
                    value={d.ausfuelldatum}
                    onChange={e => setGrunddaten({ ausfuelldatum: e.target.value })}
                />
            </div>

            <WizardNav onNext={goNext} />
        </StepWrapper>
    )
}
