import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
    WizardData, WizardStepId,
    GrunddatenData, VorhabenData, BestandData, BetriebsablaufData,
    BetriebszeitenData, MitarbeiterData, ArbeitsraeumeData,
    WasserversorgungData, AbwasserData, OberflaechenwasserData,
    StromversorgungData, BrandschutzData, TeaserData,
} from "../types/wizard.types"

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultGrunddaten: GrunddatenData = {
    antragstellerName: "", antragstellerAnschrift: "",
    kontaktName: "", kontaktAnschrift: "", kontaktTelefon: "",
    artDerAnlage: "", bezirk: "", gemeinde: "",
    strasse: "", hausnummer: "", grundstuecksnummer: "", katastralgemeinde: "",
    ausfuelldatum: new Date().toISOString().split("T")[0],
    vorhabenTyp: "neugenehmigung",
}
const defaultVorhaben: VorhabenData = {
    flaechenbeschreibung: "", gesamtflaecheQm: "", elektrischeAnschlussleistung: "unter300",
}
const defaultBestand: BestandData = {
    flaechenbeschreibungBestand: "", gesamtflaecheQmBestand: "", elektrischeAnschlussleistungBestand: "unter300",
}
const defaultBetriebsablauf: BetriebsablaufData = {
    beschreibung: "", alsAnlageBeigelegt: false,
}
const defaultBetriebszeiten: BetriebszeitenData = {
    beantragteZeiten: "", keinAenderungDerGenehmigtenZeiten: false,
    genehmigteZeiten: "", bescheidZahlDatum: "",
}
const defaultMitarbeiter: MitarbeiterData = {
    anzahlMaennlich: "", anzahlWeiblich: "", keineArbeitnehmer: false,
    toilettenMaennlich: "", toilettenWeiblich: "",
    aufenthaltsraumMaennlich: "", aufenthaltsraumWeiblich: "", aufenthaltsraumKeineVorgesehen: false,
    waschraeumeAnzahl: "", waschraeumeKeineVorgesehen: false,
    umkleideraeumeAnzahl: "", umkleideraeumeKeineVorgesehen: false,
}
const defaultArbeitsraeume: ArbeitsraeumeData = {
    rows: [{ bezeichnung: "", flaecheQm: "", raumhoehe: "", belichtungsflaeche: "", sichtverbindung: "", belueftungsflaeche: "" }],
}
const defaultWasser: WasserversorgungData = {
    oeffentlicheWasserleitung: false, oeffentlicheGemeinde: "",
    wassergenossenschaft: false, sonstige: false, privateWasserleitung: false,
    wasserrechtBewilligungLiegtVor: "",
    eigenerBrunnenTrinkwasser: false, eigenerBrunnenNutzwasser: false, eigenerBrunnenThermisch: false,
    brunnenWasserrechtBewilligung: "",
}
const defaultAbwasser: AbwasserData = {
    herkunftsbereiche: "",
    kanal: false, kanalBestaetigungDatum: "",
    vorfluter: false, senkgrube: false, senkgrubeVolumen: "", senkgrubeGeprueftAm: "",
    sonstiges: false, sonstigesText: "",
    mineraloel: "", restoel: "", schlammfang: "", fettabscheider: "", sonstigeVorbehandlung: "",
    detailprojektLiegtBei: false,
}
const defaultOberflaechenwasser: OberflaechenwasserData = {
    dachSickerschacht: "", dachVersickerungRasen: "", dachOeffentlicherKanal: "", dachVorfluter: "",
    verkehrVersickerungRasen: "", verkehrVersickerungRasenmulde: "", verkehrOeffentlicherKanal: "", verkehrVorfluter: "",
    lagerVersickerungRasen: "", lagerVersickerungRasenmulde: "", lagerOeffentlicherKanal: "", lagerVorfluter: "",
    sonstige: "", detailprojektLiegtBei: false,
}
const defaultStrom: StromversorgungData = {
    oeffentlichNeu: false, oeffentlichUnveraendert: false, oeffentlichAenderungAnschluss: false,
    eigenanlageArt: "", eigenanlageNeu: false, eigenanlageUnveraendert: false,
    notstromArt: "", notstromNeu: false, notstromUnveraendert: false,
    hochspannungsleitung: "", hochspannungstraeger: "", hochspannungAbstand: "",
}
const defaultBrandschutz: BrandschutzData = {
    sprinkleranlage: false, brandmeldeanlage: false, rauchWaermeabzug: false,
    rauchabzugStiegenhaus: false, sonstige: false, sonstigeText: "", keinGeplant: false,
    brandabschnitte: [{ bezeichnung: "", groesseQm: "" }],
}
const defaultTeaser: TeaserData = {
    maschinen: false, stoffe: false, heizung: false, kaelteKlima: false,
    lueftung: false, gasLagerung: false, sonderanlagen: false, laerm: false,
}

export const DEFAULT_WIZARD_DATA: WizardData = {
    grunddaten: defaultGrunddaten,
    vorhaben: defaultVorhaben,
    bestand: defaultBestand,
    betriebsablauf: defaultBetriebsablauf,
    betriebszeiten: defaultBetriebszeiten,
    mitarbeiter: defaultMitarbeiter,
    arbeitsraeume: defaultArbeitsraeume,
    wasserversorgung: defaultWasser,
    abwasser: defaultAbwasser,
    oberflaechenwasser: defaultOberflaechenwasser,
    stromversorgung: defaultStrom,
    brandschutz: defaultBrandschutz,
    teaser: defaultTeaser,
}

// ─── All wizard steps in order ────────────────────────────────────────────────
export const ALL_STEPS: WizardStepId[] = [
    "grunddaten", "vorhaben", "bestand", "betriebsablauf",
    "betriebszeiten", "mitarbeiter", "arbeitsraeume",
    "wasserversorgung", "abwasser", "oberflaechenwasser",
    "stromversorgung", "brandschutz", "teaser", "zusammenfassung",
]

export const STEP_LABELS: Record<WizardStepId, string> = {
    grunddaten: "Grunddaten",
    vorhaben: "Vorhaben",
    bestand: "Bestand",
    betriebsablauf: "Betriebsablauf",
    betriebszeiten: "Betriebszeiten",
    mitarbeiter: "Mitarbeiter",
    arbeitsraeume: "Arbeitsräume",
    wasserversorgung: "Wasserversorgung",
    abwasser: "Abwasser",
    oberflaechenwasser: "Oberflächenwasser",
    stromversorgung: "Stromversorgung",
    brandschutz: "Brandschutz",
    teaser: "Weitere Anlagen",
    zusammenfassung: "Fertigstellen",
}

// ─── Store ─────────────────────────────────────────────────────────────────────
type WizardStore = {
    currentStep: WizardStepId
    data: WizardData
    // derived: active steps (skips "bestand" if neugenehmigung)
    getActiveSteps: () => WizardStepId[]
    getCurrentIndex: () => number
    // navigation
    goNext: () => void
    goBack: () => void
    goToStep: (step: WizardStepId) => void
    // data setters
    setGrunddaten: (v: Partial<GrunddatenData>) => void
    setVorhaben: (v: Partial<VorhabenData>) => void
    setBestand: (v: Partial<BestandData>) => void
    setBetriebsablauf: (v: Partial<BetriebsablaufData>) => void
    setBetriebszeiten: (v: Partial<BetriebszeitenData>) => void
    setMitarbeiter: (v: Partial<MitarbeiterData>) => void
    setArbeitsraeume: (v: Partial<ArbeitsraeumeData>) => void
    setWasserversorgung: (v: Partial<WasserversorgungData>) => void
    setAbwasser: (v: Partial<AbwasserData>) => void
    setOberflaechenwasser: (v: Partial<OberflaechenwasserData>) => void
    setStromversorgung: (v: Partial<StromversorgungData>) => void
    setBrandschutz: (v: Partial<BrandschutzData>) => void
    setTeaser: (v: Partial<TeaserData>) => void
    // reset
    reset: () => void
}

export const useWizardStore = create<WizardStore>()(
    persist(
        (set, get) => ({
            currentStep: "grunddaten",
            data: DEFAULT_WIZARD_DATA,

            getActiveSteps: () => {
                const { data } = get()
                const isAenderung = data.grunddaten.vorhabenTyp === "aenderung"
                return ALL_STEPS.filter(s => s !== "bestand" || isAenderung)
            },

            getCurrentIndex: () => {
                const { currentStep, getActiveSteps } = get()
                return getActiveSteps().indexOf(currentStep)
            },

            goNext: () => {
                const { currentStep, getActiveSteps } = get()
                const steps = getActiveSteps()
                const idx = steps.indexOf(currentStep)
                if (idx < steps.length - 1) set({ currentStep: steps[idx + 1] })
            },

            goBack: () => {
                const { currentStep, getActiveSteps } = get()
                const steps = getActiveSteps()
                const idx = steps.indexOf(currentStep)
                if (idx > 0) set({ currentStep: steps[idx - 1] })
            },

            goToStep: (step) => set({ currentStep: step }),

            setGrunddaten: (v) => set(s => ({ data: { ...s.data, grunddaten: { ...s.data.grunddaten, ...v } } })),
            setVorhaben: (v) => set(s => ({ data: { ...s.data, vorhaben: { ...s.data.vorhaben, ...v } } })),
            setBestand: (v) => set(s => ({ data: { ...s.data, bestand: { ...s.data.bestand, ...v } } })),
            setBetriebsablauf: (v) => set(s => ({ data: { ...s.data, betriebsablauf: { ...s.data.betriebsablauf, ...v } } })),
            setBetriebszeiten: (v) => set(s => ({ data: { ...s.data, betriebszeiten: { ...s.data.betriebszeiten, ...v } } })),
            setMitarbeiter: (v) => set(s => ({ data: { ...s.data, mitarbeiter: { ...s.data.mitarbeiter, ...v } } })),
            setArbeitsraeume: (v) => set(s => ({ data: { ...s.data, arbeitsraeume: { ...s.data.arbeitsraeume, ...v } } })),
            setWasserversorgung: (v) => set(s => ({ data: { ...s.data, wasserversorgung: { ...s.data.wasserversorgung, ...v } } })),
            setAbwasser: (v) => set(s => ({ data: { ...s.data, abwasser: { ...s.data.abwasser, ...v } } })),
            setOberflaechenwasser: (v) => set(s => ({ data: { ...s.data, oberflaechenwasser: { ...s.data.oberflaechenwasser, ...v } } })),
            setStromversorgung: (v) => set(s => ({ data: { ...s.data, stromversorgung: { ...s.data.stromversorgung, ...v } } })),
            setBrandschutz: (v) => set(s => ({ data: { ...s.data, brandschutz: { ...s.data.brandschutz, ...v } } })),
            setTeaser: (v) => set(s => ({ data: { ...s.data, teaser: { ...s.data.teaser, ...v } } })),

            reset: () => set({ currentStep: "grunddaten", data: DEFAULT_WIZARD_DATA }),
        }),
        {
            name: "bag-wizard-v1",
            // only persist data + currentStep, skip functions
            partialize: (s) => ({ currentStep: s.currentStep, data: s.data }),
        }
    )
)
