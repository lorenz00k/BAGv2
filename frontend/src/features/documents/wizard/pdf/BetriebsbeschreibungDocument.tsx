/**
 * React-PDF document for the Betriebsbeschreibung (Formular 005-2 MA36).
 *
 * Rendering fixes applied:
 * - Single <Page> with automatic pagination — no hard-coded page breaks
 * - ALL gap properties removed — replaced with explicit marginRight/marginBottom
 * - wrap={false} removed from large sections to prevent footer overlap
 * - minPresenceAhead on section headers to keep headers with their content
 * - Unicode ♂/♀ replaced with plain text (m/w) — Helvetica compatibility
 * - Table uses absolute point widths instead of flex to prevent column drift
 * - Footer uses fixed={true} + position:absolute for reliable multi-page rendering
 * - paddingBottom increased to 55pt so content never bleeds into footer
 */
import React from "react"
import {
    Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer"
import type { WizardData } from "../types/wizard.types"

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
    navy:        "#1a3a5c",
    navyLight:   "#2a5080",
    bg:          "#f4f6f9",
    bgMid:       "#e8ecf1",
    border:      "#c8d0db",
    borderLight: "#dde3eb",
    text:        "#1a1a2e",
    textMuted:   "#5a6a7e",
    textLight:   "#8899ab",
    white:       "#ffffff",
    accent:      "#1a6bbf",
}

// ─── Page geometry ─────────────────────────────────────────────────────────────
const PAGE_H_PAD = 42   // horizontal padding (pt)
const CONTENT_W  = 595 - PAGE_H_PAD * 2  // usable width ≈ 511pt

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    page: {
        fontFamily:       "Helvetica",
        fontSize:         9,
        color:            C.text,
        paddingTop:       36,
        paddingBottom:    56,          // must exceed footer height
        paddingHorizontal: PAGE_H_PAD,
        lineHeight:       1.35,
    },

    // ── Document header ────────────────────────────────────────────────────────
    docHeader: {
        flexDirection:  "row",
        alignItems:     "flex-start",
        marginBottom:   14,
        paddingBottom:  8,
        borderBottomWidth: 1.5,
        borderBottomColor: C.navy,
    },
    docHeaderLeft: { flex: 1 },
    docHeaderRight: {
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    docTitle: {
        fontSize:    15,
        fontFamily:  "Helvetica-Bold",
        color:       C.navy,
        marginBottom: 2,
    },
    docSubtitle: { fontSize: 8, color: C.textMuted },
    docMeta:     { fontSize: 7.5, color: C.textLight, marginTop: 2 },
    docFormNo: {
        fontSize:   7.5,
        color:      C.textMuted,
        textAlign:  "right",
    },

    // ── Section ────────────────────────────────────────────────────────────────
    section: { marginBottom: 11 },
    sectionHeader: {
        flexDirection:    "row",
        alignItems:       "center",
        backgroundColor:  C.navy,
        paddingHorizontal: 8,
        paddingVertical:   4,
        marginBottom:      6,
        // minPresenceAhead keeps header with its first row of content
        minPresenceAhead: 30,
    },
    sectionRef: {
        fontSize:    7.5,
        color:       "rgba(255,255,255,0.65)",
        marginRight:  6,
    },
    sectionTitle: {
        fontSize:   9,
        fontFamily: "Helvetica-Bold",
        color:      C.white,
    },
    sectionBody: { paddingHorizontal: 2 },

    // ── Rows & Fields ──────────────────────────────────────────────────────────
    row: {
        flexDirection: "row",
        marginBottom:  5,
    },
    // Field with underline — use flex, set marginRight on non-last items via inline style
    field: { flex: 1 },
    fieldLabel: {
        fontSize:    7,
        fontFamily:  "Helvetica-Bold",
        color:       C.textMuted,
        marginBottom: 1.5,
        textTransform: "uppercase",
    },
    fieldValueLine: {
        borderBottomWidth: 0.75,
        borderBottomColor: C.border,
        minHeight:  13,
        paddingBottom: 2,
    },
    fieldValue: {
        fontSize:  8.5,
        color:     C.text,
        flexWrap:  "wrap",
    },
    fieldEmpty: {
        fontSize:  8.5,
        color:     C.textLight,
        fontFamily: "Helvetica-Oblique",
    },

    // ── Sub-labels ─────────────────────────────────────────────────────────────
    subLabel: {
        fontSize:    7.5,
        fontFamily:  "Helvetica-Bold",
        color:       C.textMuted,
        marginBottom: 3,
        marginTop:    4,
        textTransform: "uppercase",
    },

    // ── Checkboxes ─────────────────────────────────────────────────────────────
    // Wrap container: use flexWrap row WITHOUT gap — apply marginRight/Bottom to items
    checkGrid: {
        flexDirection: "row",
        flexWrap:      "wrap",
    },
    checkItem: {
        flexDirection: "row",
        alignItems:    "flex-start",
        marginRight:   14,
        marginBottom:  4,
    },
    checkBox: {
        width:         8,
        height:        8,
        borderWidth:   0.75,
        borderColor:   C.border,
        marginRight:   4,
        marginTop:     0.5,
        flexShrink:    0,
    },
    checkBoxChecked: {
        width:           8,
        height:          8,
        borderWidth:     0.75,
        borderColor:     C.accent,
        backgroundColor: C.accent,
        marginRight:     4,
        marginTop:       0.5,
        flexShrink:      0,
    },
    checkTick: {
        fontSize:   6,
        color:      C.white,
        textAlign:  "center",
        marginTop:  0.5,
        lineHeight: 1,
    },
    checkLabel: {
        fontSize:  8,
        color:     C.text,
        flexShrink: 1,
    },

    // ── Table ──────────────────────────────────────────────────────────────────
    table: {
        borderWidth:  0.5,
        borderColor:  C.border,
        marginBottom: 4,
    },
    tableHeaderRow: {
        flexDirection:    "row",
        backgroundColor:  C.bg,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
    },
    tableDataRow: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: C.borderLight,
        minHeight:    16,
    },
    tableDataRowLast: {
        flexDirection: "row",
        minHeight:    16,
    },
    tableCell: {
        paddingHorizontal: 4,
        paddingVertical:   3,
        borderRightWidth:  0.5,
        borderRightColor:  C.borderLight,
    },
    tableCellLast: {
        paddingHorizontal: 4,
        paddingVertical:   3,
    },
    tableHeadText: {
        fontSize:  7,
        fontFamily: "Helvetica-Bold",
        color:     C.textMuted,
    },
    tableCellText: {
        fontSize:  8,
        color:     C.text,
    },

    // ── Two-column layout helper ────────────────────────────────────────────────
    col2: {
        flexDirection: "row",
        marginBottom:  5,
    },
    colLeft:  { flex: 1, marginRight: 10 },
    colRight: { flex: 1 },

    // ── Bullet list ────────────────────────────────────────────────────────────
    bulletRow: {
        flexDirection: "row",
        marginBottom:  3,
    },
    bulletDot: {
        fontSize:    8,
        color:       C.textMuted,
        width:       10,
        flexShrink:  0,
    },
    bulletText: {
        fontSize:  8,
        color:     C.text,
        flex:      1,
    },

    // ── Signature ──────────────────────────────────────────────────────────────
    signatureRow: {
        flexDirection:  "row",
        marginTop:      24,
        paddingTop:     10,
        borderTopWidth: 0.75,
        borderTopColor: C.border,
    },
    signatureBox: {
        flex: 1,
        marginRight: 16,
    },
    signatureBoxLast: {
        flex: 2,
    },
    signatureLine: {
        borderBottomWidth: 0.75,
        borderBottomColor: C.textMuted,
        height:    28,
        marginBottom: 3,
    },
    signatureLabel: {
        fontSize:  7,
        fontFamily: "Helvetica-Bold",
        color:     C.textMuted,
        textTransform: "uppercase",
    },

    // ── Footer ─────────────────────────────────────────────────────────────────
    footer: {
        position:  "absolute",
        bottom:    18,
        left:      PAGE_H_PAD,
        right:     PAGE_H_PAD,
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 0.5,
        borderTopColor: C.borderLight,
        paddingTop:  4,
    },
    footerText: { fontSize: 7, color: C.textLight },
})

// ─── Helper components ─────────────────────────────────────────────────────────

function CB({ checked, label }: { checked: boolean; label: string }) {
    return (
        <View style={S.checkItem}>
            <View style={checked ? S.checkBoxChecked : S.checkBox}>
                {checked && (
                    <Text style={S.checkTick}>x</Text>
                )}
            </View>
            <Text style={S.checkLabel}>{label}</Text>
        </View>
    )
}

/** Labeled field with underline. Pass marginRight as style override for non-last fields. */
function Field({
    label,
    value,
    flex = 1,
    mr = 0,
}: {
    label: string
    value?: string
    flex?: number
    mr?: number
}) {
    const empty = !value || !value.trim()
    return (
        <View style={[S.field, { flex, marginRight: mr }]}>
            <Text style={S.fieldLabel}>{label}</Text>
            <View style={S.fieldValueLine}>
                <Text style={empty ? S.fieldEmpty : S.fieldValue}>
                    {empty ? "—" : value}
                </Text>
            </View>
        </View>
    )
}

function SectionHeader({ ref: _ref, title, paragraph }: { ref?: string; title: string; paragraph?: string }) {
    return (
        <View style={S.sectionHeader}>
            {paragraph && <Text style={S.sectionRef}>{paragraph}</Text>}
            <Text style={S.sectionTitle}>{title}</Text>
        </View>
    )
}

function SubLabel({ children }: { children: string }) {
    return <Text style={S.subLabel}>{children}</Text>
}

function Bullet({ text }: { text: string }) {
    return (
        <View style={S.bulletRow}>
            <Text style={S.bulletDot}>•</Text>
            <Text style={S.bulletText}>{text}</Text>
        </View>
    )
}

function val(v: string | undefined, fallback = "—") {
    return v && v.trim() ? v : fallback
}

// ─── Table column widths (must sum to CONTENT_W - 2×border = ~507) ────────────
// # | Bezeichnung | Fläche | Höhe | Belicht. | Sichtverb. | Belüft.
const COL_W = [22, 155, 60, 55, 65, 65, 65] as const   // total ≈ 487pt

function TableHead({ cols }: { cols: readonly string[] }) {
    return (
        <View style={S.tableHeaderRow}>
            {cols.map((c, i) => (
                <View
                    key={i}
                    style={[
                        i < cols.length - 1 ? S.tableCell : S.tableCellLast,
                        { width: COL_W[i] },
                    ]}
                >
                    <Text style={S.tableHeadText}>{c}</Text>
                </View>
            ))}
        </View>
    )
}

function TableRow({
    cells,
    isLast,
}: {
    cells: string[]
    isLast?: boolean
}) {
    return (
        <View style={isLast ? S.tableDataRowLast : S.tableDataRow}>
            {cells.map((c, i) => (
                <View
                    key={i}
                    style={[
                        i < cells.length - 1 ? S.tableCell : S.tableCellLast,
                        { width: COL_W[i] },
                    ]}
                >
                    <Text style={S.tableCellText}>{c}</Text>
                </View>
            ))}
        </View>
    )
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
            subject="Betriebsbeschreibung gemaess §353 GewO – Formular 005-2"
            creator="BAG-Assistent"
        >
            {/*
             * Single page — react-pdf handles automatic page breaks.
             * This prevents the hard-coded 3-page overflow that caused
             * lines to bleed into footer or next-page content.
             */}
            <Page size="A4" style={S.page}>

                {/* ── Document header ───────────────────────────────────────── */}
                <View style={S.docHeader}>
                    <View style={S.docHeaderLeft}>
                        <Text style={S.docTitle}>Betriebsbeschreibung</Text>
                        <Text style={S.docSubtitle}>
                            Gemaess § 353 GewO 1994 — Formular 005-2 der MA 36 Wien
                        </Text>
                        <Text style={S.docMeta}>
                            Erstellt am {generatedAt}
                            {g.antragstellerName ? `  ·  ${g.antragstellerName}` : ""}
                        </Text>
                    </View>
                    <View style={S.docHeaderRight}>
                        <Text style={S.docFormNo}>Formular 005-2</Text>
                        <Text style={S.docFormNo}>MA 36 Wien</Text>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §0  GRUNDDATEN                                              */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader title="Grunddaten und Antragsteller" />
                    <View style={S.sectionBody}>
                        <View style={S.row}>
                            <Field label="Antragsteller / Firma" value={g.antragstellerName} flex={2} mr={10} />
                            <Field label="Art des Vorhabens"
                                value={isAenderung ? "Aenderung einer genehmigten Anlage" : "Neugenehmigung"} />
                        </View>
                        <View style={S.row}>
                            <Field label="Anschrift Antragsteller" value={g.antragstellerAnschrift} flex={2} mr={10} />
                            <Field label="Ausfuelldatum" value={g.ausfuelldatum} />
                        </View>
                        <View style={S.row}>
                            <Field label="Kontaktperson" value={g.kontaktName} mr={10} />
                            <Field label="Telefon" value={g.kontaktTelefon} mr={10} />
                            <Field label="Anschrift Kontaktperson" value={g.kontaktAnschrift} flex={2} />
                        </View>
                        <View style={S.row}>
                            <Field label="Art der Anlage" value={g.artDerAnlage} flex={2} mr={10} />
                            <Field label="Bezirk" value={g.bezirk} />
                        </View>
                        <View style={S.row}>
                            <Field label="Strasse / Hausnummer"
                                value={[g.strasse, g.hausnummer].filter(Boolean).join(" ")}
                                flex={2} mr={10} />
                            <Field label="Gemeinde" value={g.gemeinde} />
                        </View>
                        <View style={S.row}>
                            <Field label="Katastralgemeinde" value={g.katastralgemeinde} mr={10} />
                            <Field label="Grundstuecksnummer" value={g.grundstuecksnummer} />
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §1.1  GEPLANTES VORHABEN                                   */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 1.1" title="Geplantes Vorhaben" />
                    <View style={S.sectionBody}>
                        <View style={S.row}>
                            <Field
                                label="Gesamtnutzflaeche (m²)"
                                value={d.vorhaben.gesamtflaecheQm}
                                mr={10}
                            />
                            <Field
                                label="Elektrische Anschlussleistung"
                                value={
                                    d.vorhaben.elektrischeAnschlussleistung === "keineMaschinen"
                                        ? "Keine maschinellen Einrichtungen"
                                        : d.vorhaben.elektrischeAnschlussleistung === "unter300"
                                            ? "unter 300 kW"
                                            : "300 kW oder mehr"
                                }
                                flex={2}
                            />
                        </View>
                        <Field label="Beschreibung der Raeume / Nutzflaechen" value={d.vorhaben.flaechenbeschreibung} />
                    </View>
                </View>

                {/* §1.2  BESTAND (nur bei Aenderung) */}
                {isAenderung && (
                    <View style={S.section}>
                        <SectionHeader paragraph="§ 1.2" title="Bestehende Anlage (Bestand)" />
                        <View style={S.sectionBody}>
                            <View style={S.row}>
                                <Field
                                    label="Gesamtnutzflaeche Bestand (m²)"
                                    value={d.bestand.gesamtflaecheQmBestand}
                                    mr={10}
                                />
                                <Field
                                    label="Elektrische Anschlussleistung Bestand"
                                    value={
                                        d.bestand.elektrischeAnschlussleistungBestand === "keineMaschinen"
                                            ? "Keine maschinellen Einrichtungen"
                                            : d.bestand.elektrischeAnschlussleistungBestand === "unter300"
                                                ? "unter 300 kW"
                                                : "300 kW oder mehr"
                                    }
                                    flex={2}
                                />
                            </View>
                            <Field
                                label="Beschreibung der bestehenden Raeume"
                                value={d.bestand.flaechenbeschreibungBestand}
                            />
                        </View>
                    </View>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §2  BETRIEBSABLAUF                                          */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 2" title="Betriebsablauf" />
                    <View style={S.sectionBody}>
                        {d.betriebsablauf.alsAnlageBeigelegt ? (
                            <Text style={S.fieldValue}>
                                Betriebsbeschreibung liegt als gesondertes Dokument bei.
                            </Text>
                        ) : (
                            <Field label="Beschreibung des Betriebsablaufs" value={d.betriebsablauf.beschreibung} />
                        )}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §3  BETRIEBSZEITEN                                          */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 3" title="Betriebszeiten" />
                    <View style={S.sectionBody}>
                        <Field label="Beantragte Betriebszeiten" value={d.betriebszeiten.beantragteZeiten} />
                        {isAenderung && (
                            d.betriebszeiten.keinAenderungDerGenehmigtenZeiten
                                ? (
                                    <Text style={[S.fieldValue, { marginTop: 3 }]}>
                                        Keine Aenderung der genehmigten Betriebszeiten.
                                    </Text>
                                ) : (
                                    <View style={S.row}>
                                        <Field
                                            label="Genehmigte Betriebszeiten"
                                            value={d.betriebszeiten.genehmigteZeiten}
                                            flex={2}
                                            mr={10}
                                        />
                                        <Field
                                            label="Bescheid-Zahl / Datum"
                                            value={d.betriebszeiten.bescheidZahlDatum}
                                        />
                                    </View>
                                )
                        )}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §4.1  ARBEITNEHMER                                          */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 4.1" title="Arbeitnehmer" />
                    <View style={S.sectionBody}>
                        {d.mitarbeiter.keineArbeitnehmer ? (
                            <Text style={S.fieldValue}>Keine Arbeitnehmer beschaeftigt.</Text>
                        ) : (
                            <View style={S.row}>
                                <Field
                                    label="Maennlich (max. gleichzeitig beschaeftigt)"
                                    value={d.mitarbeiter.anzahlMaennlich}
                                    mr={10}
                                />
                                <Field
                                    label="Weiblich (max. gleichzeitig beschaeftigt)"
                                    value={d.mitarbeiter.anzahlWeiblich}
                                />
                            </View>
                        )}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §4.2  SANITAERRAEUME                                        */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 4.2" title="Sanitaerraeume" />
                    <View style={S.sectionBody}>
                        <View style={S.row}>
                            <Field label="WC-Anlagen (m)" value={d.mitarbeiter.toilettenMaennlich} mr={10} />
                            <Field label="WC-Anlagen (w)" value={d.mitarbeiter.toilettenWeiblich} mr={10} />
                            <Field
                                label="Aufenthaltsraum"
                                value={
                                    d.mitarbeiter.aufenthaltsraumKeineVorgesehen
                                        ? "Nicht vorgesehen"
                                        : `(m) ${val(d.mitarbeiter.aufenthaltsraumMaennlich)} m²  /  (w) ${val(d.mitarbeiter.aufenthaltsraumWeiblich)} m²`
                                }
                                flex={2}
                            />
                        </View>
                        <View style={S.row}>
                            <Field
                                label="Waschraeume"
                                value={
                                    d.mitarbeiter.waschraeumeKeineVorgesehen
                                        ? "Nicht vorgesehen"
                                        : `${val(d.mitarbeiter.waschraeumeAnzahl)} Waschplaetze`
                                }
                                mr={10}
                            />
                            <Field
                                label="Umkleideraeume"
                                value={
                                    d.mitarbeiter.umkleideraeumeKeineVorgesehen
                                        ? "Nicht vorgesehen"
                                        : `${val(d.mitarbeiter.umkleideraeumeAnzahl)} Spinde`
                                }
                            />
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §4.3  ARBEITSRAEUME (table)                                 */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 4.3" title="Arbeits- und Aufenthaltsraeume" />
                    <View style={S.sectionBody}>
                        <View style={S.table}>
                            <TableHead
                                cols={["Nr.", "Bezeichnung", "Flaeche (m²)", "Hoehe (m)", "Belicht. (m²)", "Sichtverb.", "Belueft. (m²)"]}
                            />
                            {d.arbeitsraeume.rows.map((row, idx) => (
                                <TableRow
                                    key={idx}
                                    isLast={idx === d.arbeitsraeume.rows.length - 1}
                                    cells={[
                                        String(idx + 1),
                                        val(row.bezeichnung),
                                        val(row.flaecheQm),
                                        val(row.raumhoehe),
                                        val(row.belichtungsflaeche),
                                        val(row.sichtverbindung),
                                        val(row.belueftungsflaeche),
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §5.1  WASSERVERSORGUNG                                      */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 5.1" title="Wasserversorgung" />
                    <View style={S.sectionBody}>
                        <View style={S.checkGrid}>
                            <CB checked={d.wasserversorgung.oeffentlicheWasserleitung} label="Oeffentliche Wasserleitung" />
                            <CB checked={d.wasserversorgung.wassergenossenschaft}        label="Wassergenossenschaft" />
                            <CB checked={d.wasserversorgung.sonstige}                    label="Sonstige Fremdversorgung" />
                            <CB checked={d.wasserversorgung.privateWasserleitung}        label="Private Wasserleitung" />
                            <CB checked={d.wasserversorgung.eigenerBrunnenTrinkwasser}   label="Eigener Brunnen (Trinkwasser)" />
                            <CB checked={d.wasserversorgung.eigenerBrunnenNutzwasser}    label="Eigener Brunnen (Nutzwasser)" />
                            <CB checked={d.wasserversorgung.eigenerBrunnenThermisch}     label="Eigener Brunnen (Thermisch)" />
                        </View>
                        {!!d.wasserversorgung.oeffentlicheGemeinde && (
                            <Field label="Versorger" value={d.wasserversorgung.oeffentlicheGemeinde} />
                        )}
                        {(d.wasserversorgung.wasserrechtBewilligungLiegtVor ||
                            d.wasserversorgung.brunnenWasserrechtBewilligung) && (
                            <View style={S.col2}>
                                {!!d.wasserversorgung.wasserrechtBewilligungLiegtVor && (
                                    <View style={S.colLeft}>
                                        <Field
                                            label="Wasserrechtl. Bewilligung (Fremdversorgung)"
                                            value={d.wasserversorgung.wasserrechtBewilligungLiegtVor === "ja" ? "Liegt vor" : "Liegt nicht vor"}
                                        />
                                    </View>
                                )}
                                {!!d.wasserversorgung.brunnenWasserrechtBewilligung && (
                                    <View style={S.colRight}>
                                        <Field
                                            label="Wasserrechtl. Bewilligung (Brunnen)"
                                            value={d.wasserversorgung.brunnenWasserrechtBewilligung === "ja" ? "Liegt vor" : "Liegt nicht vor"}
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §5.2  ABWASSER                                              */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 5.2" title="Betriebliche Abwasserbeseitigung" />
                    <View style={S.sectionBody}>
                        <Field label="Herkunftsbereiche des Abwassers" value={d.abwasser.herkunftsbereiche} />
                        <View style={S.col2}>
                            <View style={S.colLeft}>
                                <SubLabel>Entsorgung</SubLabel>
                                <CB checked={d.abwasser.kanal}     label="Oeffentlicher Kanal" />
                                <CB checked={d.abwasser.vorfluter} label="Vorfluter" />
                                <CB checked={d.abwasser.senkgrube}
                                    label={`Senkgrube${d.abwasser.senkgrubeVolumen ? ` (${d.abwasser.senkgrubeVolumen} m³)` : ""}`} />
                                <CB checked={d.abwasser.sonstiges} label="Sonstiges" />
                                {d.abwasser.sonstiges && !!d.abwasser.sonstigesText && (
                                    <Text style={[S.checkLabel, { marginLeft: 12, marginTop: 2 }]}>
                                        {d.abwasser.sonstigesText}
                                    </Text>
                                )}
                            </View>
                            <View style={S.colRight}>
                                <SubLabel>Vorbehandlungsanlagen</SubLabel>
                                {(
                                    [
                                        ["Mineralölabscheider", d.abwasser.mineraloel],
                                        ["Restölabscheider",    d.abwasser.restoel],
                                        ["Schlammfang",         d.abwasser.schlammfang],
                                        ["Fettabscheider",      d.abwasser.fettabscheider],
                                        ["Sonstige",            d.abwasser.sonstigeVorbehandlung],
                                    ] as [string, string][]
                                ).map(([label, v]) =>
                                    v
                                        ? <Bullet key={label} text={`${label}: ${v === "bestand" ? "Bestand" : "Neu"}`} />
                                        : null
                                )}
                                {!d.abwasser.mineraloel && !d.abwasser.restoel &&
                                    !d.abwasser.schlammfang && !d.abwasser.fettabscheider &&
                                    !d.abwasser.sonstigeVorbehandlung && (
                                    <Text style={S.fieldEmpty}>Keine Vorbehandlungsanlage</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §5.3  OBERFLAECHENWASSER                                   */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 5.3" title="Oberflaechenwasserbeseitigung" />
                    <View style={S.sectionBody}>
                        {(
                            [
                                {
                                    group: "Dachlaechen",
                                    keys: ["dachSickerschacht", "dachVersickerungRasen", "dachOeffentlicherKanal", "dachVorfluter"] as const,
                                    labels: ["Sickerschacht", "Versickerung Rasen", "Oeffentl. Kanal", "Vorfluter"],
                                },
                                {
                                    group: "Verkehrsflaechen",
                                    keys: ["verkehrVersickerungRasen", "verkehrVersickerungRasenmulde", "verkehrOeffentlicherKanal", "verkehrVorfluter"] as const,
                                    labels: ["Versickerung Rasen", "Versickerung Rasenmulde", "Oeffentl. Kanal", "Vorfluter"],
                                },
                                {
                                    group: "Lagerflaechen",
                                    keys: ["lagerVersickerungRasen", "lagerVersickerungRasenmulde", "lagerOeffentlicherKanal", "lagerVorfluter"] as const,
                                    labels: ["Versickerung Rasen", "Versickerung Rasenmulde", "Oeffentl. Kanal", "Vorfluter"],
                                },
                            ] as const
                        ).map(({ group, keys, labels }) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const ow = d.oberflaechenwasser as Record<string, string>
                            const active = keys.filter(k => ow[k])
                            return (
                                <View key={group} style={{ marginBottom: 5 }}>
                                    <SubLabel>{group}</SubLabel>
                                    {active.length === 0 ? (
                                        <Text style={S.fieldEmpty}>Keine Angabe</Text>
                                    ) : (
                                        active.map(k => (
                                            <Bullet
                                                key={k}
                                                text={`${labels[keys.indexOf(k)]}: ${ow[k] === "bestand" ? "Bestand" : "Neu"}`}
                                            />
                                        ))
                                    )}
                                </View>
                            )
                        })}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §5.4  STROMVERSORGUNG                                       */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 5.4" title="Stromversorgung" />
                    <View style={S.sectionBody}>
                        <View style={S.col2}>
                            <View style={S.colLeft}>
                                <SubLabel>Oeffentliches Netz</SubLabel>
                                <CB checked={d.stromversorgung.oeffentlichNeu}               label="Neu" />
                                <CB checked={d.stromversorgung.oeffentlichUnveraendert}      label="Unveraendert" />
                                <CB checked={d.stromversorgung.oeffentlichAenderungAnschluss} label="Aenderung des Anschlusses" />
                            </View>
                            <View style={S.colRight}>
                                {!!d.stromversorgung.eigenanlageArt && (
                                    <Field
                                        label="Eigenanlage"
                                        value={`${d.stromversorgung.eigenanlageArt} — ${d.stromversorgung.eigenanlageNeu ? "Neu" : "Bestand"}`}
                                    />
                                )}
                                {!!d.stromversorgung.notstromArt && (
                                    <Field
                                        label="Notstromaggregat"
                                        value={`${d.stromversorgung.notstromArt} — ${d.stromversorgung.notstromNeu ? "Neu" : "Bestand"}`}
                                    />
                                )}
                                {d.stromversorgung.hochspannungsleitung === "ja" && (
                                    <Field
                                        label="Hochspannungsleitung im Nahbereich"
                                        value={
                                            [
                                                d.stromversorgung.hochspannungstraeger,
                                                d.stromversorgung.hochspannungAbstand
                                                    ? `${d.stromversorgung.hochspannungAbstand} m Abstand`
                                                    : "",
                                            ].filter(Boolean).join(", ")
                                        }
                                    />
                                )}
                                {d.stromversorgung.hochspannungsleitung === "nein" && (
                                    <Text style={[S.fieldValue, { marginTop: 6 }]}>
                                        Keine Hochspannungsleitung im Nahbereich
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §6  BRANDSCHUTZ                                             */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 6" title="Brandschutzmassnahmen" />
                    <View style={S.sectionBody}>
                        <View style={S.checkGrid}>
                            <CB checked={d.brandschutz.sprinkleranlage}   label="Sprinkleranlage" />
                            <CB checked={d.brandschutz.brandmeldeanlage}  label="Brandmeldeanlage (BMA)" />
                            <CB checked={d.brandschutz.rauchWaermeabzug}  label="Rauch-/Waermeabzug (RWA)" />
                            <CB checked={d.brandschutz.rauchabzugStiegenhaus} label="Rauchabzug Stiegenhaus" />
                            <CB checked={d.brandschutz.keinGeplant}       label="Keine aktive Anlage geplant" />
                        </View>
                        {d.brandschutz.sonstige && !!d.brandschutz.sonstigeText && (
                            <Field label="Sonstige Brandschutzanlage" value={d.brandschutz.sonstigeText} />
                        )}

                        {d.brandschutz.brandabschnitte.length > 0 && (
                            <View style={{ marginTop: 6 }}>
                                <SubLabel>Brandabschnitte</SubLabel>
                                <View style={S.table}>
                                    <View style={S.tableHeaderRow}>
                                        <View style={[S.tableCell, { width: 30 }]}>
                                            <Text style={S.tableHeadText}>Nr.</Text>
                                        </View>
                                        <View style={[S.tableCell, { flex: 1 }]}>
                                            <Text style={S.tableHeadText}>Bezeichnung</Text>
                                        </View>
                                        <View style={[S.tableCellLast, { width: 80 }]}>
                                            <Text style={S.tableHeadText}>Groesse (m²)</Text>
                                        </View>
                                    </View>
                                    {d.brandschutz.brandabschnitte.map((row, idx) => {
                                        const isLast = idx === d.brandschutz.brandabschnitte.length - 1
                                        return (
                                            <View key={idx} style={isLast ? S.tableDataRowLast : S.tableDataRow}>
                                                <View style={[S.tableCell, { width: 30 }]}>
                                                    <Text style={S.tableCellText}>{idx + 1}</Text>
                                                </View>
                                                <View style={[S.tableCell, { flex: 1 }]}>
                                                    <Text style={S.tableCellText}>{val(row.bezeichnung)}</Text>
                                                </View>
                                                <View style={[S.tableCellLast, { width: 80 }]}>
                                                    <Text style={S.tableCellText}>{val(row.groesseQm)}</Text>
                                                </View>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* §7–8  WEITERE ANLAGEN (Teaser)                              */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.section}>
                    <SectionHeader paragraph="§ 7 – § 8" title="Weitere Anlagen und Einrichtungen" />
                    <View style={S.sectionBody}>
                        <Text style={[S.fieldValue, { marginBottom: 5 }]}>
                            Fuer folgende Bereiche sind separate technische Beilagen erforderlich:
                        </Text>
                        <View style={S.checkGrid}>
                            <CB checked={d.teaser.maschinen}    label="Maschinen (§ 7.1)" />
                            <CB checked={d.teaser.stoffe}       label="Gefaehrl. Stoffe (§ 7.2)" />
                            <CB checked={d.teaser.heizung}      label="Heizanlage (§ 8.1)" />
                            <CB checked={d.teaser.kaelteKlima}  label="Kaelte / Klima (§ 8.2)" />
                            <CB checked={d.teaser.lueftung}     label="Lueftungsanlage (§ 8.3)" />
                            <CB checked={d.teaser.gasLagerung}  label="Gaslagerung (§ 8.4)" />
                            <CB checked={d.teaser.sonderanlagen} label="Sonderanlagen" />
                            <CB checked={d.teaser.laerm}        label="Laermquellen (§ 8.5)" />
                        </View>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* UNTERSCHRIFT                                                */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.signatureRow}>
                    <View style={S.signatureBox}>
                        <View style={S.signatureLine} />
                        <Text style={S.signatureLabel}>Ort und Datum</Text>
                    </View>
                    <View style={S.signatureBoxLast}>
                        <View style={S.signatureLine} />
                        <Text style={S.signatureLabel}>
                            Unterschrift Antragsteller / Bevollmaechtigter
                        </Text>
                    </View>
                </View>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* FOOTER — fixed renders on every page automatically          */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <View style={S.footer} fixed>
                    <Text style={S.footerText}>
                        {g.antragstellerName || "Antragsteller"}
                        {g.artDerAnlage ? `  ·  ${g.artDerAnlage}` : ""}
                    </Text>
                    <Text
                        style={S.footerText}
                        render={({ pageNumber, totalPages }) =>
                            `Seite ${pageNumber} von ${totalPages}`
                        }
                    />
                </View>

            </Page>
        </Document>
    )
}
