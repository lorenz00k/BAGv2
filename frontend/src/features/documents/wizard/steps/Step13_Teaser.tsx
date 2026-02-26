"use client"

import React from "react"
import { useWizardStore } from "../store/wizardStore"
import { StepWrapper, CheckboxField, HintBox, WizardNav } from "../components/WizardShell"

export function Step13_Teaser() {
    const { data, setTeaser } = useWizardStore()
    const d = data.teaser

    const anyChecked = Object.values(d).some(Boolean)

    return (
        <StepWrapper
            title="Weitere Anlagen & Einrichtungen"
            subtitle="Gibt es in Ihrer Anlage eines der folgenden Elemente?"
            section="§ 7 – § 8 (Hinweis)"
        >
            <div className="space-y-6">
                <HintBox>
                    Die Punkte §7 (Maschinen, Stoffe) und §8 (Heizung, Klimatechnik) erfordern separate
                    technische Beilagen, die von einem befugten Planer zu erstellen sind. Markieren Sie hier,
                    was auf Ihre Anlage zutrifft – die zuständige Behörde teilt Ihnen dann mit, welche
                    Dokumente genau beizulegen sind.
                </HintBox>

                <div className="space-y-4">
                    <CheckboxField
                        label="Maschinen und maschinelle Einrichtungen (§ 7.1)"
                        hint="Alle motor- oder elektrisch betriebenen Geräte, die in der Anlage eingesetzt werden."
                        checked={d.maschinen}
                        onChange={v => setTeaser({ maschinen: v })}
                    />
                    <CheckboxField
                        label="Gefährliche Stoffe und Zubereitungen (§ 7.2)"
                        hint="Lager- oder Verarbeitungsmengen von Chemikalien, Lösemitteln, Kraftstoffen etc."
                        checked={d.stoffe}
                        onChange={v => setTeaser({ stoffe: v })}
                    />
                    <CheckboxField
                        label="Heizanlage (§ 8.1)"
                        hint="Jede Feuerungsanlage zur Raumheizung oder Prozesswärme."
                        checked={d.heizung}
                        onChange={v => setTeaser({ heizung: v })}
                    />
                    <CheckboxField
                        label="Kälte- und Klimaanlage (§ 8.2)"
                        hint="Kühlräume, Kältemaschinen, Klimageräte mit Kältemittel."
                        checked={d.kaelteKlima}
                        onChange={v => setTeaser({ kaelteKlima: v })}
                    />
                    <CheckboxField
                        label="Lüftungsanlage (§ 8.3)"
                        hint="Mechanische Be- und Entlüftung, Abluftreinigung."
                        checked={d.lueftung}
                        onChange={v => setTeaser({ lueftung: v })}
                    />
                    <CheckboxField
                        label="Gaslagerung / Gasversorgung (§ 8.4)"
                        hint="Flüssiggas, Erdgasanschluss, Druckbehälter."
                        checked={d.gasLagerung}
                        onChange={v => setTeaser({ gasLagerung: v })}
                    />
                    <CheckboxField
                        label="Sonderanlagen (Aufzüge, Druckluftsysteme, etc.)"
                        hint="Personenaufzüge, Lastenaufzüge, Druckluftanlagen."
                        checked={d.sonderanlagen}
                        onChange={v => setTeaser({ sonderanlagen: v })}
                    />
                    <CheckboxField
                        label="Lärmquellen (§ 8.5)"
                        hint="Maschinen, Lüftungsanlagen oder Betriebsabläufe, die Außenlärm erzeugen."
                        checked={d.laerm}
                        onChange={v => setTeaser({ laerm: v })}
                    />
                </div>

                {!anyChecked && (
                    <p className="text-sm text-slate-400 italic">
                        Wenn keines zutrifft, können Sie direkt weiter.
                    </p>
                )}
            </div>

            <WizardNav />
        </StepWrapper>
    )
}
