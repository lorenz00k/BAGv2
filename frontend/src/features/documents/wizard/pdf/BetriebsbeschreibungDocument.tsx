/**
 * React-PDF document for the Betriebsbeschreibung (Formular 005-2 MA36).
 * This file must ONLY use @react-pdf/renderer primitives – no DOM elements.
 */
import React from "react"
import {
    Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer"
import type { WizardData } from "../types/wizard.types"

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 9,
        color: "#1e293b",
        paddingTop: 40,
        paddingBottom: 50,
        paddingHorizontal: 45,
        lineHeight: 1.4,
    },
    // Header
    header: { marginBottom: 18 },
    headerTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 3 },
    headerSubtitle: { fontSize: 9, color: "#64748b" },

    // Section
    section: { marginBottom: 14 },
    sectionHeader: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 6,
        borderRadius: 2,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    sectionParagraph: { fontSize: 8, color: "#64748b", fontFamily: "Helvetica-Oblique" },
    sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1e293b" },

    // Row / field
    row: { flexDirection: "row", gap: 12, marginBottom: 6 },
    field: { flex: 1 },
    fieldLabel: { fontSize: 7.5, color: "#64748b", marginBottom: 1.5, fontFamily: "Helvetica-Bold" },
    fieldValue: { fontSize: 9, color: "#1e293b" },
    fieldEmpty: { fontSize: 9, color: "#94a3b8", fontStyle: "italic" },

    // Table
    table: { marginBottom: 6 },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f8fafc",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingVertical: 3,
        paddingHorizontal: 4,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: "#e2e8f0",
        paddingVertical: 3,
        paddingHorizontal: 4,
    },
    tableColHead: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#64748b" },
    tableColCell: { fontSize: 8, color: "#1e293b" },

    // Checkbox list
    checkRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
    checkBox: {
        width: 9, height: 9, border: "1pt solid #94a3b8", borderRadius: 1,
        backgroundColor: "#f1f5f9",
    },
    checkBoxChecked: {
        width: 9, height: 9, border: "1pt solid #2563eb",
        backgroundColor: "#2563eb", borderRadius: 1,
    },
    checkLabel: { fontSize: 8.5, color: "#334155" },

    // Footer
    footer: {
        position: "absolute",
        bottom: 24,
        left: 45,
        right: 45,
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 0.5,
        borderTopColor: "#e2e8f0",
        paddingTop: 4,
    },
    footerText: { fontSize: 7, color: "#94a3b8" },

    // Divider
    divider: { borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", marginBottom: 8 },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function val(v: string | undefined, fallback = "—") {
    return v && v.trim() ? v : fallback
}

function Checkbox({ checked, label }: { checked: boolean; label: string }) {
    return (
        <View style={S.checkRow}>
            <View style={checked ? S.checkBoxChecked : S.checkBox}>
                {checked && (
                    <Text style={{ fontSize: 6.5, color: "white", textAlign: "center", marginTop: 0.5 }}>✓</Text>
                )}
            </View>
            <Text style={S.checkLabel}>{label}</Text>
        </View>
    )
}

function Field({ label, value, flex = 1 }: { label: string; value?: string; flex?: number }) {
    const isEmpty = !value || !value.trim()
    return (
        <View style={[S.field, { flex }]}>
            <Text style={S.fieldLabel}>{label.toUpperCase()}</Text>
            <Text style={isEmpty ? S.fieldEmpty : S.fieldValue}>{isEmpty ? "—" : value}</Text>
        </View>
    )
}

function Section({ paragraph, title, children }: { paragraph?: string; title: string; children: React.ReactNode }) {
    return (
        <View style={S.section} wrap={false}>
            <View style={S.sectionHeader}>
                {paragraph && <Text style={S.sectionParagraph}>{paragraph}</Text>}
                <Text style={S.sectionTitle}>{title}</Text>
            </View>
            {children}
        </View>
    )
}

function Row({ children }: { children: React.ReactNode }) {
    return <View style={S.row}>{children}</View>
}

// ─── Document ─────────────────────────────────────────────────────────────────

export function BetriebsbeschreibungDocument({ data }: { data: WizardData }) {
    const d = data
    const g = d.grunddaten
    const isAenderung = g.vorhabenTyp === "aenderung"
    const generatedAt = new Date().toLocaleDateString("de-AT", {
        day: "2-digit", month: "2-digit", year: "numeric",
    })

    return (
        <Document
            title="Betriebsbeschreibung"
            author={g.antragstellerName || "Unbekannt"}
            subject="Betriebsbeschreibung gemäß §353 GewO – Formular 005-2"
            creator="BAG-Assistent"
        >
            <Page size="A4" style={S.page}>
                {/* ── Header ── */}
                <View style={S.header}>
                    <Text style={S.headerTitle}>Betriebsbeschreibung</Text>
                    <Text style={S.headerSubtitle}>
                        Gemäß § 353 GewO 1994 · Formular 005-2 der MA 36 · Erstellt am {generatedAt}
                    </Text>
                    <View style={[S.divider, { marginTop: 8 }]} />
                </View>

                {/* ── §0 Grunddaten ── */}
                <Section title="Grunddaten & Antragsteller">
                    <Row>
                        <Field label="Antragsteller / Firma" value={g.antragstellerName} flex={2} />
                        <Field label="Art des Vorhabens" value={isAenderung ? "Änderung" : "Neugenehmigung"} />
                    </Row>
                    <Row>
                        <Field label="Anschrift Antragsteller" value={g.antragstellerAnschrift} flex={2} />
                        <Field label="Ausfülldatum" value={g.ausfuelldatum} />
                    </Row>
                    <Row>
                        <Field label="Kontaktperson" value={g.kontaktName} />
                        <Field label="Telefon" value={g.kontaktTelefon} />
                        <Field label="Anschrift Kontakt" value={g.kontaktAnschrift} flex={2} />
                    </Row>
                    <Row>
                        <Field label="Art der Anlage" value={g.artDerAnlage} flex={2} />
                        <Field label="Bezirk" value={g.bezirk} />
                    </Row>
                    <Row>
                        <Field label="Straße" value={`${g.strasse} ${g.hausnummer}`} flex={2} />
                        <Field label="Gemeinde" value={g.gemeinde} />
                    </Row>
                    <Row>
                        <Field label="Katastralgemeinde" value={g.katastralgemeinde} />
                        <Field label="Grundstücksnummer" value={g.grundstuecksnummer} />
                    </Row>
                </Section>

                {/* ── §1.1 Vorhaben ── */}
                <Section paragraph="§ 1.1" title="Geplantes Vorhaben">
                    <Row>
                        <Field label="Gesamtnutzfläche (m²)" value={d.vorhaben.gesamtflaecheQm} />
                        <Field
                            label="Elektrische Anschlussleistung"
                            value={
                                d.vorhaben.elektrischeAnschlussleistung === "keineMaschinen"
                                    ? "Keine Maschinen"
                                    : d.vorhaben.elektrischeAnschlussleistung === "unter300"
                                        ? "Unter 300 kW"
                                        : "300 kW oder mehr"
                            }
                            flex={2}
                        />
                    </Row>
                    <Field label="Beschreibung der Räume" value={d.vorhaben.flaechenbeschreibung} />
                </Section>

                {/* ── §1.2 Bestand (nur Änderung) ── */}
                {isAenderung && (
                    <Section paragraph="§ 1.2" title="Bestehende Anlage (Bestand)">
                        <Row>
                            <Field label="Gesamtnutzfläche Bestand (m²)" value={d.bestand.gesamtflaecheQmBestand} />
                            <Field
                                label="Elektrische Anschlussleistung Bestand"
                                value={
                                    d.bestand.elektrischeAnschlussleistungBestand === "keineMaschinen"
                                        ? "Keine Maschinen"
                                        : d.bestand.elektrischeAnschlussleistungBestand === "unter300"
                                            ? "Unter 300 kW"
                                            : "300 kW oder mehr"
                                }
                                flex={2}
                            />
                        </Row>
                        <Field label="Beschreibung der bestehenden Räume" value={d.bestand.flaechenbeschreibungBestand} />
                    </Section>
                )}

                {/* ── §2 Betriebsablauf ── */}
                <Section paragraph="§ 2" title="Betriebsablauf">
                    {d.betriebsablauf.alsAnlageBeigelegt ? (
                        <Text style={S.fieldValue}>Betriebsbeschreibung liegt als gesondertes Dokument bei.</Text>
                    ) : (
                        <Field label="Beschreibung" value={d.betriebsablauf.beschreibung} />
                    )}
                </Section>

                {/* ── §3 Betriebszeiten ── */}
                <Section paragraph="§ 3" title="Betriebszeiten">
                    <Field label="Beantragte Betriebszeiten" value={d.betriebszeiten.beantragteZeiten} />
                    {isAenderung && !d.betriebszeiten.keinAenderungDerGenehmigtenZeiten && (
                        <Row>
                            <Field label="Genehmigte Betriebszeiten" value={d.betriebszeiten.genehmigteZeiten} flex={2} />
                            <Field label="Bescheid-Zahl / Datum" value={d.betriebszeiten.bescheidZahlDatum} />
                        </Row>
                    )}
                    {isAenderung && d.betriebszeiten.keinAenderungDerGenehmigtenZeiten && (
                        <Text style={S.fieldValue}>Keine Änderung der genehmigten Betriebszeiten.</Text>
                    )}
                </Section>

                {/* Footer */}
                <View style={S.footer} fixed>
                    <Text style={S.footerText}>
                        {g.antragstellerName || "Antragsteller"} · {g.artDerAnlage || "Anlage"}
                    </Text>
                    <Text style={S.footerText} render={({ pageNumber, totalPages }) =>
                        `Seite ${pageNumber} von ${totalPages}`
                    } />
                </View>
            </Page>

            {/* ── Page 2: Arbeitnehmer, Räume, Wasser ── */}
            <Page size="A4" style={S.page}>
                {/* §4.1 Mitarbeiter */}
                <Section paragraph="§ 4.1" title="Arbeitnehmer">
                    {d.mitarbeiter.keineArbeitnehmer ? (
                        <Text style={S.fieldValue}>Keine Arbeitnehmer beschäftigt.</Text>
                    ) : (
                        <Row>
                            <Field label="Männlich (max. gleichzeitig)" value={d.mitarbeiter.anzahlMaennlich} />
                            <Field label="Weiblich (max. gleichzeitig)" value={d.mitarbeiter.anzahlWeiblich} />
                        </Row>
                    )}
                </Section>

                {/* §4.2 Sanitärräume */}
                <Section paragraph="§ 4.2" title="Sanitärräume">
                    <Row>
                        <Field label="WC-Anlagen männlich" value={d.mitarbeiter.toilettenMaennlich} />
                        <Field label="WC-Anlagen weiblich" value={d.mitarbeiter.toilettenWeiblich} />
                    </Row>
                    <Row>
                        <Field
                            label="Aufenthaltsraum"
                            value={
                                d.mitarbeiter.aufenthaltsraumKeineVorgesehen
                                    ? "Nicht vorgesehen"
                                    : `♂ ${d.mitarbeiter.aufenthaltsraumMaennlich} m² / ♀ ${d.mitarbeiter.aufenthaltsraumWeiblich} m²`
                            }
                        />
                        <Field
                            label="Waschräume"
                            value={d.mitarbeiter.waschraeumeKeineVorgesehen
                                ? "Nicht vorgesehen"
                                : `${d.mitarbeiter.waschraeumeAnzahl} Waschplätze`}
                        />
                        <Field
                            label="Umkleideräume"
                            value={d.mitarbeiter.umkleideraeumeKeineVorgesehen
                                ? "Nicht vorgesehen"
                                : `${d.mitarbeiter.umkleideraeumeAnzahl} Spinde`}
                        />
                    </Row>
                </Section>

                {/* §4.3 Arbeitsräume Tabelle */}
                <Section paragraph="§ 4.3" title="Arbeits- und Aufenthaltsräume">
                    <View style={S.table}>
                        <View style={S.tableHeader}>
                            {["#", "Bezeichnung", "Fläche (m²)", "Höhe (m)", "Belicht. (m²)", "Sichtverb.", "Belüft. (m²)"].map((h, i) => (
                                <Text key={i} style={[S.tableColHead, { flex: i === 1 ? 3 : 1 }]}>{h}</Text>
                            ))}
                        </View>
                        {d.arbeitsraeume.rows.map((row, idx) => (
                            <View key={idx} style={S.tableRow}>
                                <Text style={[S.tableColCell, { flex: 1 }]}>{idx + 1}</Text>
                                <Text style={[S.tableColCell, { flex: 3 }]}>{val(row.bezeichnung)}</Text>
                                <Text style={[S.tableColCell, { flex: 1 }]}>{val(row.flaecheQm)}</Text>
                                <Text style={[S.tableColCell, { flex: 1 }]}>{val(row.raumhoehe)}</Text>
                                <Text style={[S.tableColCell, { flex: 1 }]}>{val(row.belichtungsflaeche)}</Text>
                                <Text style={[S.tableColCell, { flex: 1 }]}>{val(row.sichtverbindung)}</Text>
                                <Text style={[S.tableColCell, { flex: 1 }]}>{val(row.belueftungsflaeche)}</Text>
                            </View>
                        ))}
                    </View>
                </Section>

                {/* §5.1 Wasserversorgung */}
                <Section paragraph="§ 5.1" title="Wasserversorgung">
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        <Checkbox checked={d.wasserversorgung.oeffentlicheWasserleitung} label="Öffentliche Wasserleitung" />
                        <Checkbox checked={d.wasserversorgung.wassergenossenschaft} label="Wassergenossenschaft" />
                        <Checkbox checked={d.wasserversorgung.sonstige} label="Sonstige Fremdversorgung" />
                        <Checkbox checked={d.wasserversorgung.privateWasserleitung} label="Private Wasserleitung" />
                        <Checkbox checked={d.wasserversorgung.eigenerBrunnenTrinkwasser} label="Brunnen (Trinkwasser)" />
                        <Checkbox checked={d.wasserversorgung.eigenerBrunnenNutzwasser} label="Brunnen (Nutzwasser)" />
                        <Checkbox checked={d.wasserversorgung.eigenerBrunnenThermisch} label="Brunnen (Thermisch)" />
                    </View>
                    {d.wasserversorgung.oeffentlicheGemeinde && (
                        <Field label="Versorger" value={d.wasserversorgung.oeffentlicheGemeinde} />
                    )}
                </Section>

                {/* §5.2 Abwasser */}
                <Section paragraph="§ 5.2" title="Betriebliche Abwasserbeseitigung">
                    <Field label="Herkunftsbereiche" value={d.abwasser.herkunftsbereiche} />
                    <Row>
                        <View style={{ flex: 1 }}>
                            <Checkbox checked={d.abwasser.kanal} label="Öffentlicher Kanal" />
                            <Checkbox checked={d.abwasser.vorfluter} label="Vorfluter" />
                            <Checkbox checked={d.abwasser.senkgrube} label={`Senkgrube (${d.abwasser.senkgrubeVolumen || "—"} m³)`} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[S.fieldLabel, { marginBottom: 3 }]}>VORBEHANDLUNGSANLAGEN</Text>
                            {[
                                ["Mineralölabscheider", d.abwasser.mineraloel],
                                ["Restölabscheider", d.abwasser.restoel],
                                ["Schlammfang", d.abwasser.schlammfang],
                                ["Fettabscheider", d.abwasser.fettabscheider],
                            ].map(([label, v]) =>
                                v ? <Text key={label as string} style={S.checkLabel}>• {label as string}: {v === "bestand" ? "Bestand" : "Neu"}</Text> : null
                            )}
                        </View>
                    </Row>
                </Section>

                <View style={S.footer} fixed>
                    <Text style={S.footerText}>
                        {g.antragstellerName || "Antragsteller"} · {g.artDerAnlage || "Anlage"}
                    </Text>
                    <Text style={S.footerText} render={({ pageNumber, totalPages }) =>
                        `Seite ${pageNumber} von ${totalPages}`
                    } />
                </View>
            </Page>

            {/* ── Page 3: Oberfläche, Strom, Brandschutz, Teaser ── */}
            <Page size="A4" style={S.page}>
                {/* §5.3 Oberflächenwasser */}
                <Section paragraph="§ 5.3" title="Oberflächenwasserbeseitigung">
                    {(["Dachflächen", "Verkehrsflächen", "Lagerflächen"] as const).map((group, gi) => {
                        const keys = gi === 0
                            ? ["dachSickerschacht", "dachVersickerungRasen", "dachOeffentlicherKanal", "dachVorfluter"]
                            : gi === 1
                                ? ["verkehrVersickerungRasen", "verkehrVersickerungRasenmulde", "verkehrOeffentlicherKanal", "verkehrVorfluter"]
                                : ["lagerVersickerungRasen", "lagerVersickerungRasenmulde", "lagerOeffentlicherKanal", "lagerVorfluter"]
                        const labels = gi === 0
                            ? ["Sickerschacht", "Versickerung Rasen", "Öff. Kanal", "Vorfluter"]
                            : gi === 1
                                ? ["Versickerung Rasen", "Versickerung Rasenmulde", "Öff. Kanal", "Vorfluter"]
                                : ["Versickerung Rasen", "Versickerung Rasenmulde", "Öff. Kanal", "Vorfluter"]
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const ow = d.oberflaechenwasser as unknown as Record<string, string>
                        const hasAny = keys.some(k => ow[k])
                        return (
                            <View key={group} style={{ marginBottom: 4 }}>
                                <Text style={[S.fieldLabel, { marginBottom: 2 }]}>{group.toUpperCase()}</Text>
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                                    {keys.map((k, i) => ow[k] ? (
                                        <Text key={k} style={S.checkLabel}>• {labels[i]}: {ow[k] === "bestand" ? "Bestand" : "Neu"}</Text>
                                    ) : null)}
                                    {!hasAny && <Text style={S.fieldEmpty}>Keine Angabe</Text>}
                                </View>
                            </View>
                        )
                    })}
                </Section>

                {/* §5.4 Strom */}
                <Section paragraph="§ 5.4" title="Stromversorgung">
                    <Row>
                        <View style={{ flex: 1 }}>
                            <Text style={[S.fieldLabel, { marginBottom: 3 }]}>ÖFFENTLICHES NETZ</Text>
                            <Checkbox checked={d.stromversorgung.oeffentlichNeu} label="Neu" />
                            <Checkbox checked={d.stromversorgung.oeffentlichUnveraendert} label="Unverändert" />
                            <Checkbox checked={d.stromversorgung.oeffentlichAenderungAnschluss} label="Änderung Anschluss" />
                        </View>
                        <View style={{ flex: 1 }}>
                            {d.stromversorgung.eigenanlageArt && (
                                <Field label="Eigenanlage" value={`${d.stromversorgung.eigenanlageArt} (${d.stromversorgung.eigenanlageNeu ? "Neu" : "Bestand"})`} />
                            )}
                            {d.stromversorgung.notstromArt && (
                                <Field label="Notstrom" value={`${d.stromversorgung.notstromArt} (${d.stromversorgung.notstromNeu ? "Neu" : "Bestand"})`} />
                            )}
                            {d.stromversorgung.hochspannungsleitung === "ja" && (
                                <Field label="Hochspannungsleitung" value={`${d.stromversorgung.hochspannungstraeger}, ${d.stromversorgung.hochspannungAbstand} m Abstand`} />
                            )}
                        </View>
                    </Row>
                </Section>

                {/* §6 Brandschutz */}
                <Section paragraph="§ 6" title="Brandschutzmaßnahmen">
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                        <Checkbox checked={d.brandschutz.sprinkleranlage} label="Sprinkleranlage" />
                        <Checkbox checked={d.brandschutz.brandmeldeanlage} label="Brandmeldeanlage (BMA)" />
                        <Checkbox checked={d.brandschutz.rauchWaermeabzug} label="Rauch-/Wärmeabzug (RWA)" />
                        <Checkbox checked={d.brandschutz.rauchabzugStiegenhaus} label="Rauchabzug Stiegenhaus" />
                        <Checkbox checked={d.brandschutz.keinGeplant} label="Keine aktive Anlage geplant" />
                    </View>
                    {d.brandschutz.sonstige && (
                        <Field label="Sonstige Anlage" value={d.brandschutz.sonstigeText} />
                    )}
                    {d.brandschutz.brandabschnitte.length > 0 && (
                        <View style={S.table}>
                            <Text style={[S.fieldLabel, { marginBottom: 3 }]}>BRANDABSCHNITTE</Text>
                            {d.brandschutz.brandabschnitte.map((row, idx) => (
                                <View key={idx} style={S.tableRow}>
                                    <Text style={[S.tableColCell, { flex: 1 }]}>{idx + 1}</Text>
                                    <Text style={[S.tableColCell, { flex: 4 }]}>{val(row.bezeichnung)}</Text>
                                    <Text style={[S.tableColCell, { flex: 1 }]}>{val(row.groesseQm)} m²</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </Section>

                {/* §7–8 Teaser */}
                <Section paragraph="§ 7 – § 8" title="Weitere Anlagen und Einrichtungen (Hinweis)">
                    <Text style={[S.fieldValue, { marginBottom: 6 }]}>
                        Für folgende Punkte sind separate technische Beilagen beizufügen:
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        <Checkbox checked={d.teaser.maschinen} label="Maschinen (§ 7.1)" />
                        <Checkbox checked={d.teaser.stoffe} label="Gefährl. Stoffe (§ 7.2)" />
                        <Checkbox checked={d.teaser.heizung} label="Heizanlage (§ 8.1)" />
                        <Checkbox checked={d.teaser.kaelteKlima} label="Kälte/Klima (§ 8.2)" />
                        <Checkbox checked={d.teaser.lueftung} label="Lüftungsanlage (§ 8.3)" />
                        <Checkbox checked={d.teaser.gasLagerung} label="Gaslagerung (§ 8.4)" />
                        <Checkbox checked={d.teaser.sonderanlagen} label="Sonderanlagen" />
                        <Checkbox checked={d.teaser.laerm} label="Lärmquellen (§ 8.5)" />
                    </View>
                </Section>

                {/* Unterschrift */}
                <View style={{ marginTop: 20, borderTopWidth: 0.5, borderTopColor: "#e2e8f0", paddingTop: 12 }}>
                    <Row>
                        <View style={{ flex: 2 }}>
                            <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#334155", marginBottom: 4, height: 20 }} />
                            <Text style={S.fieldLabel}>ORT, DATUM</Text>
                        </View>
                        <View style={{ flex: 3 }}>
                            <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#334155", marginBottom: 4, height: 20 }} />
                            <Text style={S.fieldLabel}>UNTERSCHRIFT ANTRAGSTELLER / BEVOLLMÄCHTIGTER</Text>
                        </View>
                    </Row>
                </View>

                <View style={S.footer} fixed>
                    <Text style={S.footerText}>
                        {g.antragstellerName || "Antragsteller"} · {g.artDerAnlage || "Anlage"}
                    </Text>
                    <Text style={S.footerText} render={({ pageNumber, totalPages }) =>
                        `Seite ${pageNumber} von ${totalPages}`
                    } />
                </View>
            </Page>
        </Document>
    )
}
