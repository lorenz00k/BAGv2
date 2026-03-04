"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import { StepWrapper, HintBox, WizardNav } from "../components/WizardShell"
import { RepeatableTable } from "../components/RepeatableTable"
import type { ColumnDef } from "../components/RepeatableTable"
import type { ArbeitsraumRow } from "../types/wizard.types"

const EMPTY_ROW: ArbeitsraumRow = {
    bezeichnung: "",
    flaecheQm: "",
    raumhoehe: "",
    belichtungsflaeche: "",
    sichtverbindung: "",
    belueftungsflaeche: "",
}

const COLUMNS: ColumnDef<ArbeitsraumRow>[] = [
    { key: "bezeichnung", label: "Bezeichnung / Nutzung", placeholder: "z.B. Werkstatt EG", width: "min-w-[160px]" },
    { key: "flaecheQm", label: "Fläche (m²)", placeholder: "80", type: "number", width: "w-24" },
    { key: "raumhoehe", label: "Raumhöhe (m)", placeholder: "3,0", width: "w-28" },
    { key: "belichtungsflaeche", label: "Belichtungsfläche (m²)", placeholder: "8", type: "number", width: "w-36" },
    { key: "sichtverbindung", label: "Sichtverbindung ins Freie (m²)", placeholder: "4", width: "w-36" },
    { key: "belueftungsflaeche", label: "Belüftungsfläche (m²)", placeholder: "4", type: "number", width: "w-32" },
]

export function Step07_Arbeitsraeume() {
    const { data, setArbeitsraeume } = useWizardStore()
    const rows = data.arbeitsraeume.rows

    return (
        <StepWrapper
            title="Arbeits- und Aufenthaltsräume"
            subtitle="Tragen Sie alle Arbeitsräume mit ihren Maßen ein."
            section="§ 4.3"
        >
            <div className="space-y-6">
                <HintBox>
                    Für jeden Arbeitsraum sind Fläche, Raumhöhe sowie Belichtungs- und Belüftungsflächen
                    maßgebend. Die Werte können Sie aus den Bauplänen entnehmen oder schätzen – sie werden
                    von der Behörde anhand der Pläne geprüft.
                </HintBox>

                <RepeatableTable<ArbeitsraumRow>
                    rows={rows}
                    columns={COLUMNS}
                    emptyRow={EMPTY_ROW}
                    onChange={rows => setArbeitsraeume({ rows })}
                    addLabel="Raum hinzufügen"
                />
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
