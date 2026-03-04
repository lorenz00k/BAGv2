"use client"

import React from "react"
import { useWizardStore } from "./store/wizardStore"
import { WizardShell } from "./components/WizardShell"

// Steps
import { Step01_Grunddaten } from "./steps/Step01_Grunddaten"
import { Step02_Vorhaben } from "./steps/Step02_Vorhaben"
import { Step03_Bestand } from "./steps/Step03_Bestand"
import { Step04_Betriebsablauf } from "./steps/Step04_Betriebsablauf"
import { Step05_Betriebszeiten } from "./steps/Step05_Betriebszeiten"
import { Step06_Mitarbeiter } from "./steps/Step06_Mitarbeiter"
import { Step07_Arbeitsraeume } from "./steps/Step07_Arbeitsraeume"
import { Step08_Wasserversorgung } from "./steps/Step08_Wasserversorgung"
import { Step09_Abwasser } from "./steps/Step09_Abwasser"
import { Step10_Oberflaechenwasser } from "./steps/Step10_Oberflaechenwasser"
import { Step11_Stromversorgung } from "./steps/Step11_Stromversorgung"
import { Step12_Brandschutz } from "./steps/Step12_Brandschutz"
import { Step13_Teaser } from "./steps/Step13_Teaser"
import { Step14_Zusammenfassung } from "./steps/Step14_Zusammenfassung"
import type { WizardStepId } from "./types/wizard.types"

const STEP_COMPONENTS: Record<WizardStepId, React.FC> = {
    grunddaten: Step01_Grunddaten,
    vorhaben: Step02_Vorhaben,
    bestand: Step03_Bestand,
    betriebsablauf: Step04_Betriebsablauf,
    betriebszeiten: Step05_Betriebszeiten,
    mitarbeiter: Step06_Mitarbeiter,
    arbeitsraeume: Step07_Arbeitsraeume,
    wasserversorgung: Step08_Wasserversorgung,
    abwasser: Step09_Abwasser,
    oberflaechenwasser: Step10_Oberflaechenwasser,
    stromversorgung: Step11_Stromversorgung,
    brandschutz: Step12_Brandschutz,
    teaser: Step13_Teaser,
    zusammenfassung: Step14_Zusammenfassung,
}

export function WizardClient() {
    const { currentStep, reset } = useWizardStore()
    const StepComponent = STEP_COMPONENTS[currentStep]

    return (
        <WizardShell onReset={reset}>
            <StepComponent />
        </WizardShell>
    )
}
