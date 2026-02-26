"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import {
    StepWrapper, TextInput, CheckboxField, FieldDivider, HintBox, WizardNav,
} from "../components/WizardShell"
import { RepeatableTable } from "../components/RepeatableTable"
import type { ColumnDef } from "../components/RepeatableTable"
import type { BrandabschnittRow } from "../types/wizard.types"

const EMPTY_ROW: BrandabschnittRow = { bezeichnung: "", groesseQm: "" }

const COLUMNS: ColumnDef<BrandabschnittRow>[] = [
    { key: "bezeichnung", label: "Bezeichnung des Brandabschnitts", placeholder: "z.B. Werkstatt EG" },
    { key: "groesseQm", label: "Größe (m²)", placeholder: "200", type: "number", width: "w-28" },
]

export function Step12_Brandschutz() {
    const { data, setBrandschutz } = useWizardStore()
    const d = data.brandschutz

    return (
        <StepWrapper
            title="Brandschutzmaßnahmen"
            subtitle="Welche aktiven und passiven Brandschutzanlagen sind geplant oder vorhanden?"
            section="§ 6"
        >
            <div className="space-y-6">
                <HintBox>
                    Aktive Brandschutzanlagen (Sprinkler, Melder) müssen von einem zugelassenen Planer
                    dimensioniert werden. Geben Sie hier an, was geplant ist – die Details kommen als Beilage.
                </HintBox>

                <FieldDivider label="Aktive Brandschutzanlagen" />

                <div className="space-y-3">
                    <CheckboxField
                        label="Sprinkleranlage"
                        checked={d.sprinkleranlage}
                        onChange={v => setBrandschutz({ sprinkleranlage: v })}
                    />
                    <CheckboxField
                        label="Brandmeldeanlage (BMA)"
                        checked={d.brandmeldeanlage}
                        onChange={v => setBrandschutz({ brandmeldeanlage: v })}
                    />
                    <CheckboxField
                        label="Rauch- und Wärmeabzugsanlage (RWA)"
                        checked={d.rauchWaermeabzug}
                        onChange={v => setBrandschutz({ rauchWaermeabzug: v })}
                    />
                    <CheckboxField
                        label="Rauchabzug Stiegenhaus"
                        checked={d.rauchabzugStiegenhaus}
                        onChange={v => setBrandschutz({ rauchabzugStiegenhaus: v })}
                    />
                    <CheckboxField
                        label="Sonstige Brandschutzanlage"
                        checked={d.sonstige}
                        onChange={v => setBrandschutz({ sonstige: v })}
                    />
                    {d.sonstige && (
                        <TextInput
                            label="Beschreibung"
                            placeholder="z.B. CO-Warnanlage, Löschanlage"
                            value={d.sonstigeText}
                            onChange={e => setBrandschutz({ sonstigeText: e.target.value })}
                            className="ml-8"
                        />
                    )}
                    <CheckboxField
                        label="Keine aktive Brandschutzanlage geplant"
                        checked={d.keinGeplant}
                        onChange={v => setBrandschutz({ keinGeplant: v })}
                    />
                </div>

                <FieldDivider label="Brandabschnitte" />

                <p className="text-sm text-slate-500 -mt-2">
                    Tragen Sie die Brandabschnitte ein, wie sie im Brandschutzkonzept ausgewiesen sind.
                    Mindestens ein Eintrag, wenn das Objekt mehrere Brandabschnitte hat.
                </p>

                <RepeatableTable<BrandabschnittRow>
                    rows={d.brandabschnitte}
                    columns={COLUMNS}
                    emptyRow={EMPTY_ROW}
                    onChange={rows => setBrandschutz({ brandabschnitte: rows })}
                    addLabel="Brandabschnitt hinzufügen"
                />
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
