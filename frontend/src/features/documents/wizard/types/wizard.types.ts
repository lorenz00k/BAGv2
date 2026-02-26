// ─── Grunddaten (Step 01) ─────────────────────────────────────────────────────
export type GrunddatenData = {
    antragstellerName: string
    antragstellerAnschrift: string
    kontaktName: string
    kontaktAnschrift: string
    kontaktTelefon: string
    artDerAnlage: string
    bezirk: string
    gemeinde: string
    strasse: string
    hausnummer: string
    grundstuecksnummer: string
    katastralgemeinde: string
    ausfuelldatum: string
    /** Neugenehmigung | Änderung */
    vorhabenTyp: "neugenehmigung" | "aenderung"
}

// ─── Vorhaben §1.1 (Step 02) ──────────────────────────────────────────────────
export type VorhabenData = {
    flaechenbeschreibung: string
    gesamtflaecheQm: string
    elektrischeAnschlussleistung: "unter300" | "ueber300" | "keineMaschinen"
}

// ─── Bestand §1.2 (Step 03 – nur bei Änderung) ───────────────────────────────
export type BestandData = {
    flaechenbeschreibungBestand: string
    gesamtflaecheQmBestand: string
    elektrischeAnschlussleistungBestand: "unter300" | "ueber300" | "keineMaschinen"
}

// ─── Betriebsablauf §2 (Step 04) ─────────────────────────────────────────────
export type BetriebsablaufData = {
    beschreibung: string
    /** true = als Beilage eingereicht */
    alsAnlageBeigelegt: boolean
}

// ─── Betriebszeiten §3 (Step 05) ─────────────────────────────────────────────
export type BetriebszeitenData = {
    beantragteZeiten: string
    /** nur bei Änderung */
    keinAenderungDerGenehmigtenZeiten: boolean
    genehmigteZeiten: string
    bescheidZahlDatum: string
}

// ─── Mitarbeiter + Sanitärräume §4.1 + §4.2 (Step 06) ───────────────────────
export type MitarbeiterData = {
    anzahlMaennlich: string
    anzahlWeiblich: string
    keineArbeitnehmer: boolean
    // Sanitärräume
    toilettenMaennlich: string
    toilettenWeiblich: string
    aufenthaltsraumMaennlich: string
    aufenthaltsraumWeiblich: string
    aufenthaltsraumKeineVorgesehen: boolean
    waschraeumeAnzahl: string
    waschraeumeKeineVorgesehen: boolean
    umkleideraeumeAnzahl: string
    umkleideraeumeKeineVorgesehen: boolean
}

// ─── Arbeitsräume §4.3 (Step 07) ─────────────────────────────────────────────
export type ArbeitsraumRow = {
    bezeichnung: string
    flaecheQm: string
    raumhoehe: string
    belichtungsflaeche: string
    sichtverbindung: string
    belueftungsflaeche: string
}

export type ArbeitsraeumeData = {
    rows: ArbeitsraumRow[]
}

// ─── Wasserversorgung §5.1 (Step 08) ──────────────────────────────────────────
export type WasserversorgungData = {
    oeffentlicheWasserleitung: boolean
    oeffentlicheGemeinde: string
    wassergenossenschaft: boolean
    sonstige: boolean
    privateWasserleitung: boolean
    wasserrechtBewilligungLiegtVor: "" | "ja" | "nein"
    eigenerBrunnenTrinkwasser: boolean
    eigenerBrunnenNutzwasser: boolean
    eigenerBrunnenThermisch: boolean
    brunnenWasserrechtBewilligung: "" | "ja" | "nein"
}

// ─── Betriebliche Abwasserbeseitigung §5.2 (Step 09) ─────────────────────────
export type AbwasserData = {
    herkunftsbereiche: string
    kanal: boolean
    kanalBestaetigungDatum: string
    vorfluter: boolean
    senkgrube: boolean
    senkgrubeVolumen: string
    senkgrubeGeprueftAm: string
    sonstiges: boolean
    sonstigesText: string
    // Vorbehandlungsanlagen
    mineraloel: "" | "bestand" | "neu"
    restoel: "" | "bestand" | "neu"
    schlammfang: "" | "bestand" | "neu"
    fettabscheider: "" | "bestand" | "neu"
    sonstigeVorbehandlung: "" | "bestand" | "neu"
    detailprojektLiegtBei: boolean
}

// ─── Oberflächenwasser §5.3 (Step 10) ────────────────────────────────────────
type BestandNeu = "" | "bestand" | "neu"
export type OberflaechenwasserData = {
    // Dachflächen
    dachSickerschacht: BestandNeu
    dachVersickerungRasen: BestandNeu
    dachOeffentlicherKanal: BestandNeu
    dachVorfluter: BestandNeu
    // Verkehrsflächen
    verkehrVersickerungRasen: BestandNeu
    verkehrVersickerungRasenmulde: BestandNeu
    verkehrOeffentlicherKanal: BestandNeu
    verkehrVorfluter: BestandNeu
    // Lagerflächen
    lagerVersickerungRasen: BestandNeu
    lagerVersickerungRasenmulde: BestandNeu
    lagerOeffentlicherKanal: BestandNeu
    lagerVorfluter: BestandNeu
    sonstige: BestandNeu
    detailprojektLiegtBei: boolean
}

// ─── Stromversorgung §5.4 (Step 11) ───────────────────────────────────────────
export type StromversorgungData = {
    oeffentlichNeu: boolean
    oeffentlichUnveraendert: boolean
    oeffentlichAenderungAnschluss: boolean
    eigenanlageArt: string
    eigenanlageNeu: boolean
    eigenanlageUnveraendert: boolean
    notstromArt: string
    notstromNeu: boolean
    notstromUnveraendert: boolean
    hochspannungsleitung: "" | "nein" | "ja"
    hochspannungstraeger: string
    hochspannungAbstand: string
}

// ─── Brandschutz §6 (Step 12) ────────────────────────────────────────────────
export type BrandabschnittRow = {
    bezeichnung: string
    groesseQm: string
}

export type BrandschutzData = {
    sprinkleranlage: boolean
    brandmeldeanlage: boolean
    rauchWaermeabzug: boolean
    rauchabzugStiegenhaus: boolean
    sonstige: boolean
    sonstigeText: string
    keinGeplant: boolean
    brandabschnitte: BrandabschnittRow[]
}

// ─── §7–8 Teaser (Step 13) ───────────────────────────────────────────────────
export type TeaserData = {
    maschinen: boolean
    stoffe: boolean
    heizung: boolean
    kaelteKlima: boolean
    lueftung: boolean
    gasLagerung: boolean
    sonderanlagen: boolean
    laerm: boolean
}

// ─── Zusammenfassung (Step 14) ───────────────────────────────────────────────
// no extra data – just triggers PDF generation

// ─── Gesamter Wizard-State ────────────────────────────────────────────────────
export type WizardData = {
    grunddaten: GrunddatenData
    vorhaben: VorhabenData
    bestand: BestandData
    betriebsablauf: BetriebsablaufData
    betriebszeiten: BetriebszeitenData
    mitarbeiter: MitarbeiterData
    arbeitsraeume: ArbeitsraeumeData
    wasserversorgung: WasserversorgungData
    abwasser: AbwasserData
    oberflaechenwasser: OberflaechenwasserData
    stromversorgung: StromversorgungData
    brandschutz: BrandschutzData
    teaser: TeaserData
}

export const WIZARD_STEP_COUNT = 14

export type WizardStepId =
    | "grunddaten"
    | "vorhaben"
    | "bestand"
    | "betriebsablauf"
    | "betriebszeiten"
    | "mitarbeiter"
    | "arbeitsraeume"
    | "wasserversorgung"
    | "abwasser"
    | "oberflaechenwasser"
    | "stromversorgung"
    | "brandschutz"
    | "teaser"
    | "zusammenfassung"
