"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, CheckboxField, FieldDivider, HintBox, WizardNav,
} from "../components/WizardShell"

export function Step06_Mitarbeiter() {
    const { data, setMitarbeiter } = useWizardStore()
    const d = data.mitarbeiter

    return (
        <StepWrapper
            title="Mitarbeiter & Sanitärräume"
            subtitle="Wie viele Personen arbeiten in der Anlage? Welche Sozialeinrichtungen gibt es?"
            section="§ 4.1 + § 4.2"
        >
            <div className="space-y-6">
                <HintBox>
                    Die Anzahl der Arbeitnehmer bestimmt die gesetzlichen Mindestanforderungen an
                    Toiletten, Wasch- und Umkleideräume. Geben Sie die <strong>maximale gleichzeitige
                    Belegschaft</strong> an.
                </HintBox>

                <FieldDivider label="§ 4.1 – Arbeitnehmer" />

                <CheckboxField
                    label="Keine Arbeitnehmer beschäftigt"
                    checked={d.keineArbeitnehmer}
                    onChange={v => setMitarbeiter({ keineArbeitnehmer: v })}
                />

                {!d.keineArbeitnehmer && (
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            label="Männliche Arbeitnehmer (max. gleichzeitig)"
                            type="number"
                            placeholder="0"
                            value={d.anzahlMaennlich}
                            onChange={e => setMitarbeiter({ anzahlMaennlich: e.target.value })}
                        />
                        <TextInput
                            label="Weibliche Arbeitnehmer (max. gleichzeitig)"
                            type="number"
                            placeholder="0"
                            value={d.anzahlWeiblich}
                            onChange={e => setMitarbeiter({ anzahlWeiblich: e.target.value })}
                        />
                    </div>
                )}

                <FieldDivider label="§ 4.2 – Sanitärräume" />

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            label="WC-Anlagen männlich (Anzahl)"
                            type="number"
                            placeholder="0"
                            value={d.toilettenMaennlich}
                            onChange={e => setMitarbeiter({ toilettenMaennlich: e.target.value })}
                        />
                        <TextInput
                            label="WC-Anlagen weiblich (Anzahl)"
                            type="number"
                            placeholder="0"
                            value={d.toilettenWeiblich}
                            onChange={e => setMitarbeiter({ toilettenWeiblich: e.target.value })}
                        />
                    </div>

                    <CheckboxField
                        label="Kein Aufenthaltsraum vorgesehen"
                        checked={d.aufenthaltsraumKeineVorgesehen}
                        onChange={v => setMitarbeiter({ aufenthaltsraumKeineVorgesehen: v })}
                    />
                    {!d.aufenthaltsraumKeineVorgesehen && (
                        <div className="grid grid-cols-2 gap-4">
                            <TextInput
                                label="Aufenthaltsraum männlich (m²)"
                                type="number"
                                placeholder="0"
                                value={d.aufenthaltsraumMaennlich}
                                onChange={e => setMitarbeiter({ aufenthaltsraumMaennlich: e.target.value })}
                            />
                            <TextInput
                                label="Aufenthaltsraum weiblich (m²)"
                                type="number"
                                placeholder="0"
                                value={d.aufenthaltsraumWeiblich}
                                onChange={e => setMitarbeiter({ aufenthaltsraumWeiblich: e.target.value })}
                            />
                        </div>
                    )}

                    <CheckboxField
                        label="Keine Waschräume vorgesehen"
                        checked={d.waschraeumeKeineVorgesehen}
                        onChange={v => setMitarbeiter({ waschraeumeKeineVorgesehen: v })}
                    />
                    {!d.waschraeumeKeineVorgesehen && (
                        <TextInput
                            label="Waschräume (Anzahl Waschplätze)"
                            type="number"
                            placeholder="0"
                            value={d.waschraeumeAnzahl}
                            onChange={e => setMitarbeiter({ waschraeumeAnzahl: e.target.value })}
                        />
                    )}

                    <CheckboxField
                        label="Keine Umkleideräume vorgesehen"
                        checked={d.umkleideraeumeKeineVorgesehen}
                        onChange={v => setMitarbeiter({ umkleideraeumeKeineVorgesehen: v })}
                    />
                    {!d.umkleideraeumeKeineVorgesehen && (
                        <TextInput
                            label="Umkleideräume (Anzahl Spinde)"
                            type="number"
                            placeholder="0"
                            value={d.umkleideraeumeAnzahl}
                            onChange={e => setMitarbeiter({ umkleideraeumeAnzahl: e.target.value })}
                        />
                    )}
                </div>
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
