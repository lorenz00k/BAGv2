"use client"

import React, { useState, useEffect } from "react"
import clsx from "clsx"
import {
    FileText, CheckCircle2, Circle, ChevronDown, AlertTriangle,
    Building2, Wind, Thermometer, Volume2, Trash2, MapPin,
    Flame, Users, Phone, Mail, Info, BookOpen, ArrowRight,
    Zap, RotateCcw, Package, Wand2,
} from "lucide-react"

import { Section } from "@/components/layout/Section"
import { Container } from "@/components/layout/Container"
import SectionHeading from "@/components/layout/SectionHeading/SectionHeading"
import { Card, CardIcon, CardTitle, CardBody } from "@/components/ui/Card"
import { AutoGrid } from "@/components/common/AutoGrid"
import { Button } from "@/components/ui/Button"
import { Heading } from "@/components/typography/Heading"
import { Text } from "@/components/typography/Text"
import BreakPoint from "@/components/common/BreakPoint"
import CtaPanel from "@/components/ui/CtaPanels/CtaPanel"
import { SectionSeparator } from "@/components/layout/SectionSeperator"

// ─── Types ────────────────────────────────────────────────────────────────────

type MandatoryDoc = {
    id: string
    title: string
    hint: string
    copies: number | null
    why: string
}

type Category = {
    id: string
    number: string
    title: string
    Icon: React.ElementType
    tone: "default" | "warm" | "accentSoft" | "success" | "shield"
    why: string
    items: string[]
    conditional?: boolean
}

type ContactEntry = {
    name: string
    districts: string
    email: string
    phone: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MANDATORY_DOCS: MandatoryDoc[] = [
    {
        id: "antrag",
        title: "Antrag",
        hint: "Der offizielle Startschuss Ihres Verfahrens",
        copies: 1,
        why: "Der Antrag ist das formelle Gesuch an die Behörde. Er enthält Ihre Identität als Antragsteller und definiert, was genau genehmigt werden soll. Ohne ihn läuft kein Verfahren an.",
    },
    {
        id: "betriebsbeschreibung",
        title: "Betriebsbeschreibung",
        hint: "Was machen Sie, wann und wie?",
        copies: 4,
        why: "Die Betriebsbeschreibung erklärt der Behörde in eigenen Worten, wie Ihr Betrieb funktioniert: Tätigkeiten, Abläufe, Betriebszeiten. Je klarer, desto weniger Rückfragen.",
    },
    {
        id: "maschinenverzeichnis",
        title: "Verzeichnis der Maschinen und Betriebseinrichtungen",
        hint: "Welche Geräte und Anlagen nutzen Sie?",
        copies: 4,
        why: "Dieses Verzeichnis zeigt, welche technischen Anlagen in Ihrem Betrieb im Einsatz sind und welche Emissionen (Lärm, Abgase, etc.) sie maximal erzeugen können.",
    },
    {
        id: "plaene",
        title: "Erforderliche Pläne und Skizzen",
        hint: "Grundrisse, Schnitte, Ansichten Ihrer Anlage",
        copies: 4,
        why: "Pläne visualisieren Ihren Betrieb räumlich. Die Behörde prüft damit Abstände zu Nachbarn, Fluchtwege und Brandabschnitte. Professionelle Planzeichnungen sind hier meist notwendig.",
    },
    {
        id: "abfallwirtschaft",
        title: "Abfallwirtschaftskonzept",
        hint: "Wie gehen Sie mit anfallenden Abfällen um?",
        copies: 4,
        why: "Jeder Betrieb produziert Abfälle. Das Konzept zeigt der Behörde, wie Sie diese korrekt trennen, zwischenlagern und entsorgen – Pflichtbestandteil jeder Neugenehmigung.",
    },
    {
        id: "technische-angaben",
        title: "Technische Angaben",
        hint: "Fachliche Details zu erwarteten Emissionen",
        copies: 1,
        why: "Diese Angaben ermöglichen der Behörde eine fachliche Beurteilung: Wie laut wird es? Was wird in die Luft abgegeben? Hier brauchen Sie oft einen Techniker oder Ziviltechniker.",
    },
    {
        id: "andere-rechtsvorschriften",
        title: "Projektunterlagen zu anderen Rechtsvorschriften",
        hint: "z. B. wasserrechtliche Bewilligungen",
        copies: null,
        why: "Falls Ihr Betrieb auch anderen Gesetzen unterliegt (z. B. Wasserrecht, Forstrecht), müssen die entsprechenden Nachweise mitingereicht werden. Art und Anzahl variieren.",
    },
]

const CATEGORIES: Category[] = [
    {
        id: "allgemein",
        number: "4.2",
        title: "Allgemeine Anforderungen",
        Icon: Building2,
        tone: "default",
        why: "Das Fundament jeder Einreichung. Diese Angaben geben der Behörde einen vollständigen Überblick: Wo ist Ihr Betrieb? Was tun Sie dort? Wann? Mit welchen Stoffen? Ohne diese Basis kann das Verfahren nicht starten.",
        items: [
            "Allgemeine Beschreibung der Betriebsanlage (Lage, Gebäude, Flächen)",
            "Bei Änderung: Beschreibung aller geplanten Änderungen",
            "Beschreibung der betrieblichen Tätigkeiten (Produktion, Verkauf, Arbeitsschritte)",
            "Beschreibung der elektrischen Anlage(n)",
            "Betriebszeiten, Öffnungszeiten und Anlieferungszeiten",
            "Technische Beschreibung von maschinellen Anlagen (Lüftung, Kälte, Produktion)",
            "Verzeichnis verwendeter Stoffe (Chemikalien, brennbare Flüssigkeiten) mit Mengen und Lagerort",
        ],
    },
    {
        id: "brandschutz",
        number: "4.3",
        title: "Brandschutztechnische Angaben",
        Icon: Flame,
        tone: "warm",
        why: "Brandschutz rettet Leben – und ist daher ein Kernthema im Verfahren. Die Behörde prüft Brandabschnitte, Löschmittel, Fluchtwege und Sicherheitsbeleuchtung. Ohne ausreichenden Brandschutz gibt es keine Genehmigung.",
        items: [
            "Brandabschnitte und Brandwiderstandsklassen (z. B. EI 90)",
            "Gebäudeklasse (bei größeren Betriebsobjekten)",
            "Vorgesehene Erste Löschhilfe",
            "Geplante brandschutztechnische Anlagen (Brandmeldeanlage, Sprinkler, Rauchabzüge)",
            "Organisatorischer Brandschutz (Brandschutzbeauftragter, Brandschutzordnung)",
            "Ausführung der Sicherheitsbeleuchtung",
        ],
    },
    {
        id: "lueftung",
        number: "4.4.1",
        title: "Lüftungsanlagen",
        Icon: Wind,
        tone: "accentSoft",
        why: "Lüftungsanlagen sind einer der häufigsten Streitpunkte mit Nachbarn: Sie können Gerüche und Lärm übertragen. Die Behörde prüft genau, wohin die Luft geführt wird und ob Emissionen an der Grundstücksgrenze noch zumutbar sind.",
        items: [
            "Technische Lüftungsbeschreibung",
            "Lüftungsbilanz (Zu- und Abluftvolumina je Anlage und Raum)",
            "Situierung von Ansaug- und Fortluftstellen",
            "Schallemissionen der Ventilatoren in dB(A) mit Entfernungsangabe",
            "Schallemissionen von Fortluft- und Ansaugstellen, Entfernung zum nächsten Nachbar",
            "Volumenstrom (m³/h), Luftgeschwindigkeit (m/s) und Luftfilter",
            "Durchmesser der Lüftungskanäle und Strömungsgeschwindigkeiten",
            "Geruchsmindernde Maßnahmen (UV-C, Ozongenerator, Aktivkohle) – falls vorhanden",
        ],
    },
    {
        id: "kaelte-heizung",
        number: "4.4.2–3",
        title: "Kälte- & Heizungsanlagen",
        Icon: Thermometer,
        tone: "success",
        why: "Kühlanlagen und Wärmepumpen machen Lärm – oft rund um die Uhr. Die Behörde prüft, ob die Schallemissionen für Nachbarn zumutbar sind. Bei Kälteanlagen spielen auch Kältemittelmengen eine Rolle.",
        items: [
            "Beschreibung der Kälteanlage (Kühlung, Situierung der Rückkühler)",
            "Versorgte Kühlstellen und deren Aufstellort",
            "Kältemittelart und -menge inkl. Leitungsnetz",
            "Schallemissionen der Rückkühler und Entfernung zum nächsten Nachbar",
            "Art der Beheizung der Betriebsanlage",
            "Heizungsanlagenteile (Pufferspeicher, Ausdehnungsgefäß)",
            "Wärmeverteilung (Radiatoren, Fußbodenheizung, Umlufterhitzer)",
            "Bei Pelletsanlage: Nennwärmeleistung, Lager, Abgasführung, Sicherheitseinrichtungen",
        ],
    },
    {
        id: "emissionen",
        number: "4.5",
        title: "Emissionserklärung",
        Icon: Volume2,
        tone: "warm",
        why: "Lärm, Geruch, Staub und Abwasser – das sind die vier Hauptgründe, warum Nachbarn Einspruch erheben. Eine vollständige Emissionserklärung zeigt, dass Sie die gesetzlichen Grenzwerte einhalten und Konflikte vermeiden.",
        items: [
            "Schallemissionen als Schallleistungspegel dB(A) oder Dauerschallpegel mit Entfernungsangabe",
            "Entfernung Emissionsstellen zu Nachbarn (Fenster, Terrassen)",
            "Schallemissionen von Musikanlagen (Betriebszeiten, Lautstärke, Messort)",
            "Schallemissionen durch Anlieferungen und Warentransport",
            "Schallschutzmaßnahmen (Schallschutzhauben, Vorsatzschalen, bauliche Maßnahmen)",
            "Staubemissionen bei Manipulation im Freien",
            "Anfallende Abwässer und deren Aufbereitung und Entsorgung",
            "Mineralöl- oder Fettabscheider inkl. Kanalplan (falls geplant)",
            "Geruchsemissionen in GE/h – zwingend bei Betrieben mit Holzkohlegriller",
        ],
    },
    {
        id: "arbeitnehmerschutz",
        number: "4.6",
        title: "Arbeitnehmerschutz",
        Icon: Users,
        tone: "shield",
        why: "Der Schutz Ihrer Mitarbeiter ist gesetzlich verankert. Die Behörde prüft, ob Sanitäranlagen, Tageslicht, Sichtverbindungen und Arbeitsmittel den Mindeststandards entsprechen – Ihr Team hat ein Recht darauf.",
        items: [
            "Anzahl der Beschäftigten (gesamt und maximal gleichzeitig)",
            "Beschreibung der Arbeitsvorgänge",
            "Nachweis ausreichender Lichteintrittsflächen und Sichtverbindung ins Freie",
            "Zur Verwendung gelangende Arbeitsmittel",
            "Sanitäranlagen, Umkleide- und Duschmöglichkeiten",
            "Beschreibung der ständigen Arbeitsbereiche",
        ],
    },
    {
        id: "plaene-zeichnungen",
        number: "4.7",
        title: "Pläne & Zeichnungen",
        Icon: MapPin,
        tone: "accentSoft",
        why: "Pläne sind die Sprache des Genehmigungsverfahrens. Alles, was die Behörde nicht sehen kann, muss eingezeichnet sein: Maße, Räume, Fluchtwege, Maschinen. Fehlerhafte Pläne sind der häufigste Grund für Nachbesserungen.",
        items: [
            "Lageplan mit Betriebsanlage und Abständen zu Nachbarn",
            "Grundrisspläne mit Maßstabsangabe",
            "Betriebsanlagengrenzen und Brandabschnittsgrenzen (z. B. EI 90)",
            "Raumwidmungen, Raumgrößen, -höhen und Fußbodenoberflächen",
            "Bemaßung von Türen, Fenstern, Treppen und Einzelstufen",
            "Handläufe, Absturzsicherungen und Verglasungsart (ESG/VSG) vermerkt",
            "Fluchtwege mit Breiten, Notausgänge mit maximaler Personenanzahl",
            "Maschinenaufstellplan mit Positionsnummern",
            "Lüftungsplan (bei vorhandenen Lüftungsanlagen)",
        ],
    },
    {
        id: "explosionsschutz",
        number: "4.8",
        title: "Explosionsschutz",
        Icon: Zap,
        tone: "warm",
        conditional: true,
        why: "Nur relevant, wenn in Ihrem Betrieb Stäube (z. B. Bäckerei, Tischlerei) oder brennbare Gase entstehen. In diesem Fall muss eine Betrachtung zeigen, dass keine Explosionsgefahr für Personen besteht.",
        items: [
            "Explosionsschutzbetrachtung bei Staubentstehung (z. B. Bäckereien, Tischlereien)",
            "Explosionsschutzbetrachtung bei brennbaren Gasen, Dämpfen oder Nebeln",
        ],
    },
    {
        id: "abfall",
        number: "4.9",
        title: "Abfallwirtschaftskonzept (Detailangaben)",
        Icon: Trash2,
        tone: "success",
        why: "Zusätzlich zum Pflichtdokument braucht die Behörde Detailangaben zur Abfallwirtschaft. Orientierung gibt der Leitfaden des BMK und der Wirtschaftskammer Österreich.",
        items: [
            "Abfallarten, erwartete Mengen und Schlüsselnummern",
            "Zwischenlagerung der Abfälle",
            "Entsorgungsweg für jeden Abfalltyp",
            "Geplante Maßnahmen zur Reduktion der Abfallmengen",
        ],
    },
]

const MA36_CONTACTS: ContactEntry[] = [
    { name: "GT-Zentrum", districts: "01, 03, 04, 05, 06, 07, 08", email: "zentrum@ma36.wien.gv.at", phone: "+43 1 4000-36168" },
    { name: "GT-Süd", districts: "02, 10, 11, 23", email: "sued@ma36.wien.gv.at", phone: "+43 1 4000-36169" },
    { name: "GT-West", districts: "12, 13, 14, 15, 16, 17", email: "west@ma36.wien.gv.at", phone: "+43 1 4000-36171" },
    { name: "GT-Nord-Ost", districts: "09, 18, 19, 20, 21, 22", email: "nordost@ma36.wien.gv.at", phone: "+43 1 4000-36172" },
]

const MBA_CONTACTS: ContactEntry[] = [
    { name: "MBA 1/8", districts: "01, 03, 04, 05, 06, 07, 08", email: "post@mba01.wien.gv.at", phone: "+43 1 4000-01000" },
    { name: "MBA 10", districts: "02, 10, 11, 23", email: "post@mba10.wien.gv.at", phone: "+43 1 4000-10000" },
    { name: "MBA 12", districts: "12, 13, 14, 15, 16, 17", email: "post@mba12.wien.gv.at", phone: "+43 1 4000-12000" },
    { name: "MBA 21", districts: "09, 18, 19, 20, 21, 22", email: "post@mba21.wien.gv.at", phone: "+43 1 4000-21000" },
]

const STORAGE_KEY = "bag-docs-checklist"

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Zeigt den Genehmigungsprozess in 3 klaren Schritten */
function ProcessGuide() {
    const steps = [
        {
            num: "1",
            title: "Unterlagen sammeln",
            desc: "Diese Seite listet alles auf, was Sie brauchen.",
            active: true,
        },
        {
            num: "2",
            title: "Beim MBA einreichen",
            desc: "Antrag inkl. aller Unterlagen beim Bezirksamt abgeben.",
            active: false,
        },
        {
            num: "3",
            title: "Genehmigung erhalten",
            desc: "MA 36 prüft fachlich – bei Vollständigkeit erhalten Sie den Bescheid.",
            active: false,
        },
    ]

    return (
        <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">
                So funktioniert das Verfahren
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-stretch sm:items-start">
                {steps.map((step, i) => (
                    <React.Fragment key={step.num}>
                        <div className={clsx(
                            "flex-1 rounded-[var(--radius-sm)] p-4 transition-colors",
                            step.active
                                ? "bg-[var(--color-accent-soft)] border border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
                                : "bg-transparent"
                        )}>
                            <div className={clsx(
                                "w-8 h-8 rounded-full grid place-items-center text-sm font-bold mb-3",
                                step.active
                                    ? "bg-[var(--color-accent)] text-white"
                                    : "bg-slate-100 text-slate-400"
                            )}>
                                {step.num}
                            </div>
                            <p className={clsx(
                                "font-semibold text-base mb-1",
                                step.active ? "text-[var(--color-accent-strong)]" : "text-slate-600"
                            )}>
                                {step.title}
                            </p>
                            <p className="text-sm text-slate-500 leading-5">{step.desc}</p>
                            {step.active && (
                                <span className="inline-block mt-3 text-xs font-semibold text-[var(--color-accent)] bg-white border border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] px-2.5 py-1 rounded-full">
                                    Sie sind hier
                                </span>
                            )}
                        </div>

                        {i < steps.length - 1 && (
                            <div className="hidden sm:flex items-center px-2 self-center">
                                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" aria-hidden />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

function CopyBadge({ copies }: { copies: number | null }) {
    if (copies === null) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-[var(--color-border)] text-slate-500">
                je nach Projekt
            </span>
        )
    }
    return (
        <span className={clsx(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap",
            copies === 1
                ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] text-[var(--color-accent-strong)] border border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
        )}>
            {copies}× Kopie{copies > 1 ? "n" : ""}
        </span>
    )
}

function ProgressDisplay({ checked, total }: { checked: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((checked / total) * 100)
    const allDone = checked === total
    const remaining = total - checked

    return (
        <div className={clsx(
            "rounded-[var(--radius)] border p-6 transition-all duration-300",
            allDone
                ? "bg-[var(--color-accent-soft)] border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] shadow-[var(--shadow-sm)]"
                : "bg-[var(--color-surface)] border-[var(--color-border)] shadow-[var(--shadow-xs)]"
        )}>
            <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-0.5">Fortschritt</p>
                    <p className="text-3xl font-bold text-slate-800 tabular-nums leading-none">
                        {checked}
                        <span className="text-lg text-slate-400 font-semibold"> / {total}</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        {allDone
                            ? "Alle Pflichtdokumente vorbereitet"
                            : `Noch ${remaining} Dokument${remaining !== 1 ? "e" : ""} ausstehend`
                        }
                    </p>
                </div>

                <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
                        <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
                        <circle
                            cx="32" cy="32" r="26"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 26}`}
                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                            className={clsx("transition-all duration-500 ease-out", allDone ? "text-[var(--color-accent)]" : "text-[var(--color-accent)]")}
                        />
                    </svg>
                    <span className={clsx(
                        "absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums",
                        allDone ? "text-[var(--color-accent-strong)]" : "text-slate-600"
                    )}>
                        {pct}%
                    </span>
                </div>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${checked} von ${total} Pflichtdokumenten vorbereitet`}
                />
            </div>

            {allDone && (
                <p className="mt-4 text-base font-semibold text-[var(--color-accent-strong)] flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden />
                    Perfekt! Sie können Ihren Antrag jetzt einreichen.
                </p>
            )}
        </div>
    )
}

function InfoCallout({
    children,
    variant = "info",
}: {
    children: React.ReactNode
    variant?: "info" | "warning"
}) {
    const isWarning = variant === "warning"
    return (
        <div className={clsx(
            "rounded-[var(--radius)] border p-5 flex gap-4",
            isWarning
                ? "bg-[color-mix(in_srgb,#f59e0b_8%,var(--color-surface))] border-[color-mix(in_srgb,#f59e0b_40%,transparent)]"
                : "bg-[var(--color-accent-soft)] border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
        )}>
            <div className="flex-shrink-0 mt-0.5">
                {isWarning
                    ? <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden />
                    : <Info className="w-5 h-5 text-[var(--color-accent)]" aria-hidden />
                }
            </div>
            <div className="text-base leading-7 text-slate-700">{children}</div>
        </div>
    )
}

function DocCheckItem({
    doc,
    checked,
    onToggle,
}: {
    doc: MandatoryDoc
    checked: boolean
    onToggle: () => void
}) {
    const [showWhy, setShowWhy] = useState(false)

    return (
        <div className={clsx(
            "rounded-[var(--radius)] border transition-all duration-200",
            checked
                ? "bg-[var(--color-accent-soft)] border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]"
                : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[color-mix(in_srgb,var(--color-accent)_30%,var(--color-border))] hover:shadow-[var(--shadow-xs)]"
        )}>
            <div className="flex items-start gap-4 p-5">

                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    className="flex-shrink-0 mt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] rounded-full"
                    aria-label={checked ? `${doc.title} als nicht erledigt markieren` : `${doc.title} als erledigt markieren`}
                >
                    {checked
                        ? <CheckCircle2 className="w-6 h-6 text-[var(--color-accent)]" aria-hidden />
                        : <Circle className="w-6 h-6 text-slate-300" aria-hidden />
                    }
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                        <span className={clsx(
                            "font-semibold text-base leading-snug transition-colors",
                            checked ? "text-slate-400 line-through" : "text-slate-800"
                        )}>
                            {doc.title}
                        </span>
                        <CopyBadge copies={doc.copies} />
                    </div>

                    <p className={clsx(
                        "text-sm leading-5 transition-colors",
                        checked ? "text-slate-400" : "text-slate-500"
                    )}>
                        {doc.hint}
                    </p>

                    {showWhy && (
                        <div className="mt-3 rounded-[var(--radius-sm)] bg-white border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] p-3.5">
                            <p className="text-sm text-slate-700 leading-6">{doc.why}</p>
                        </div>
                    )}
                </div>

                {/* Why toggle */}
                <button
                    onClick={() => setShowWhy(v => !v)}
                    className={clsx(
                        "flex-shrink-0 flex items-center gap-1.5 text-sm font-medium transition-colors mt-0.5 px-3 py-1.5 rounded-[var(--radius-sm)] border",
                        showWhy
                            ? "text-[var(--color-accent-strong)] bg-white border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
                            : "text-slate-400 bg-transparent border-transparent hover:text-[var(--color-accent)] hover:border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] hover:bg-[var(--color-accent-soft)]"
                    )}
                    aria-label={showWhy ? "Erklärung ausblenden" : "Warum wird dieses Dokument benötigt?"}
                >
                    <Info className="w-4 h-4" aria-hidden />
                    <span className="hidden sm:inline">{showWhy ? "Weniger" : "Warum?"}</span>
                </button>
            </div>
        </div>
    )
}

function CategoryAccordion({
    category,
    isOpen,
    onToggle,
}: {
    category: Category
    isOpen: boolean
    onToggle: () => void
}) {
    const { Icon, tone } = category

    const iconToneClasses: Record<Category["tone"], string> = {
        default: "bg-[var(--card-icon-bg)] text-[var(--card-icon-fg)]",
        warm: "bg-[var(--card-icon-warm-bg)] text-[var(--card-icon-warm-fg)]",
        accentSoft: "bg-[var(--card-icon-accentSoft-bg)] text-[var(--card-icon-accentSoft-fg)]",
        success: "bg-[var(--card-icon-success-bg)] text-[var(--card-icon-success-fg)]",
        shield: "bg-[var(--card-icon-shield-bg)] text-[var(--card-icon-shield-fg)]",
    }

    return (
        <div className={clsx(
            "rounded-[var(--radius)] border bg-[var(--color-surface)] transition-all duration-200",
            isOpen
                ? "shadow-[var(--shadow-sm)] border-[color-mix(in_srgb,var(--color-accent)_25%,var(--color-border))]"
                : "border-[var(--color-border)] hover:border-[color-mix(in_srgb,var(--color-accent)_20%,var(--color-border))] hover:shadow-[var(--shadow-xs)]"
        )}>
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] rounded-[var(--radius)]"
                aria-expanded={isOpen}
            >
                <div className={clsx(
                    "w-11 h-11 rounded-[var(--radius-sm)] grid place-items-center flex-shrink-0",
                    iconToneClasses[tone]
                )}>
                    <Icon className="w-5 h-5" aria-hidden />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-400 tracking-wide">{category.number}</span>
                        <span className="font-semibold text-base text-slate-800">{category.title}</span>
                        {category.conditional && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                nur bei Bedarf
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {category.items.length} {category.items.length === 1 ? "Angabe" : "Angaben"} erforderlich
                    </p>
                </div>

                <ChevronDown className={clsx(
                    "w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                )} aria-hidden />
            </button>

            {isOpen && (
                <div className="px-5 pb-6 space-y-5">
                    {/* Why callout */}
                    <div className="rounded-[var(--radius-sm)] px-5 py-4 bg-[var(--color-accent-soft)] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
                        <p className="text-base text-slate-700 leading-7">
                            <span className="font-semibold text-[var(--color-accent-strong)]">Warum? </span>
                            {category.why}
                        </p>
                    </div>

                    {/* Items list */}
                    <ul className="space-y-3" role="list">
                        {category.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3.5 text-base text-slate-700 leading-6">
                                <div className="w-6 h-6 rounded-full bg-[var(--color-accent-soft)] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] grid place-items-center flex-shrink-0 mt-0.5">
                                    <span className="text-[11px] font-bold text-[var(--color-accent-strong)]">{idx + 1}</span>
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

function ContactCard({ name, districts, email, phone }: ContactEntry) {
    return (
        <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3.5 shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] hover:border-[color-mix(in_srgb,var(--color-accent)_20%,var(--color-border))] transition-all duration-200">
            <div>
                <h4 className="font-semibold text-base text-slate-800">{name}</h4>
                <p className="text-sm text-slate-500 mt-0.5">Bezirke: {districts}</p>
            </div>
            <div className="space-y-2.5">
                <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 text-base text-[var(--color-accent)] hover:underline"
                >
                    <Mail className="w-4 h-4 flex-shrink-0" aria-hidden />
                    <span className="truncate">{email}</span>
                </a>
                <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2.5 text-base text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <Phone className="w-4 h-4 flex-shrink-0" aria-hidden />
                    {phone}
                </a>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DokumentePageClient({ locale }: { locale: string }) {
    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
    const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
    const [districtInput, setDistrictInput] = useState("")
    const [activeContactTab, setActiveContactTab] = useState<"ma36" | "mba">("ma36")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) setCheckedIds(new Set(JSON.parse(stored) as string[]))
        } catch {
            // ignore storage errors
        }
        setMounted(true)
    }, [])

    const toggleDoc = (id: string) => {
        setCheckedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
            return next
        })
    }

    const resetChecklist = () => {
        setCheckedIds(new Set())
        try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    }

    const toggleCategory = (id: string) => {
        setOpenCategories(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const districtNum = parseInt(districtInput.trim(), 10)
    const isValidDistrict = !isNaN(districtNum) && districtNum >= 1 && districtNum <= 23

    const matchesDistrict = (districts: string): boolean => {
        if (!isValidDistrict) return true
        return districts.split(",").map(d => parseInt(d.trim(), 10)).includes(districtNum)
    }

    const ma36Filtered = MA36_CONTACTS.filter(c => matchesDistrict(c.districts))
    const mbaFiltered = MBA_CONTACTS.filter(c => matchesDistrict(c.districts))
    const allOpen = openCategories.size === CATEGORIES.length

    return (
        <>
            {/* ── Hero ──────────────────────────────────────────────────── */}
            <Section>
                <Container>
                    <SectionHeading
                        id="documents-title"
                        title="Ihre Unterlagencheckliste"
                        subtitle="Alles, was Sie für die Betriebsanlagengenehmigung in Wien einreichen müssen – übersichtlich und Schritt für Schritt."
                        as="h1"
                        subtitleAs="p"
                    />

                    <BreakPoint size="sm" />

                    {/* ── Wizard Hero Banner ─────────────────────────────── */}
                    <a
                        href={`/${locale}/betriebsbeschreibung`}
                        className="group flex flex-col sm:flex-row sm:items-center gap-5 rounded-[var(--radius)] border-2 border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] bg-gradient-to-br from-[var(--color-accent-soft)] via-[var(--color-accent-soft)] to-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-[var(--color-accent)] transition-all duration-200 no-underline"
                    >
                        <div className="w-14 h-14 rounded-[var(--radius-sm)] bg-[var(--color-accent)] grid place-items-center flex-shrink-0 shadow-[var(--shadow-xs)] group-hover:scale-105 transition-transform duration-200">
                            <Wand2 className="w-7 h-7 text-white" aria-hidden />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg text-slate-900 leading-snug mb-1">
                                Betriebsbeschreibung automatisch ausfüllen
                            </p>
                            <p className="text-sm text-slate-500 leading-5">
                                Unser Assistent führt Sie in wenigen Minuten durch alle Felder — am Ende laden Sie ein fertiges PDF herunter.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white text-sm font-semibold shadow-[var(--shadow-xs)] group-hover:bg-[var(--color-accent-strong)] transition-colors whitespace-nowrap flex-shrink-0">
                            Assistent starten
                            <ArrowRight className="w-4 h-4" aria-hidden />
                        </div>
                    </a>

                    <BreakPoint />
                    <ProcessGuide />
                </Container>
            </Section>

            <SectionSeparator />

            {/* ── Pflichtdokumente Checklist ─────────────────────────────── */}
            <Section>
                <Container>
                    <Heading as="h2">Gesetzliche Pflichtdokumente</Heading>
                    <Text>
                        Diese <strong>7 Dokumente</strong> müssen immer eingereicht werden – egal wie groß oder klein Ihr Vorhaben ist. Die Zahl der benötigten Kopien ist gesetzlich festgelegt (§353 GewO).
                    </Text>

                    <BreakPoint />

                    {mounted && (
                        <ProgressDisplay
                            checked={checkedIds.size}
                            total={MANDATORY_DOCS.length}
                        />
                    )}

                    <BreakPoint size="sm" />

                    <div className="space-y-3" role="list">
                        {MANDATORY_DOCS.map(doc => (
                            <div key={doc.id} role="listitem">
                                <DocCheckItem
                                    doc={doc}
                                    checked={mounted ? checkedIds.has(doc.id) : false}
                                    onToggle={() => toggleDoc(doc.id)}
                                />
                            </div>
                        ))}
                    </div>

                    <BreakPoint size="sm" />

                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-start gap-2 text-sm text-slate-400">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden />
                            <span>Ihr Fortschritt wird lokal im Browser gespeichert.</span>
                        </div>
                        {mounted && checkedIds.size > 0 && (
                            <button
                                onClick={resetChecklist}
                                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                                Zurücksetzen
                            </button>
                        )}
                    </div>

                    <BreakPoint />

                    {/* ── Wizard CTA ─────────────────────────────────────── */}
                    <div className="rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--color-accent)_30%,var(--color-border))] bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                            <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[var(--color-accent)] grid place-items-center flex-shrink-0">
                                <Wand2 className="w-6 h-6 text-white" aria-hidden />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-base text-slate-800 leading-snug">
                                    Betriebsbeschreibung automatisch ausfüllen
                                </p>
                                <p className="text-sm text-slate-500 mt-1 leading-5">
                                    Unser Formular-Assistent führt Sie Schritt für Schritt durch alle Felder des Formulars 005-2 –
                                    am Ende laden Sie ein fertiges PDF herunter.
                                </p>
                            </div>
                            <a
                                href={`/${locale}/betriebsbeschreibung`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-white text-sm font-semibold shadow-[var(--shadow-xs)] hover:bg-[var(--color-accent-strong)] transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                Assistent starten
                                <ArrowRight className="w-4 h-4" aria-hidden />
                            </a>
                        </div>
                    </div>
                </Container>
            </Section>

            <SectionSeparator />

            {/* ── Projektunterlagen (Accordion) ──────────────────────────── */}
            <Section>
                <Container>
                    <Heading as="h2">Projektunterlagen nach Thema</Heading>
                    <Text>
                        Neben den Pflichtdokumenten braucht die Behörde je nach Art Ihres Betriebs spezifische Angaben. Klappen Sie die Bereiche auf, die für Sie relevant sind – und erfahren Sie, warum diese Angaben wichtig sind.
                    </Text>
                    <BreakPoint />

                    <InfoCallout>
                        <strong>Hinweis:</strong> Die benötigte Detailtiefe variiert je nach Projektgröße. Klären Sie die genauen Anforderungen für Ihr Vorhaben auf einem <strong>Projektsprechtag</strong> der MA 36 – kostenlos und unverbindlich.
                    </InfoCallout>

                    <BreakPoint />

                    <div className="flex gap-2 mb-5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenCategories(
                                allOpen ? new Set() : new Set(CATEGORIES.map(c => c.id))
                            )}
                        >
                            {allOpen ? "Alle zuklappen" : "Alle aufklappen"}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {CATEGORIES.map(cat => (
                            <CategoryAccordion
                                key={cat.id}
                                category={cat}
                                isOpen={openCategories.has(cat.id)}
                                onToggle={() => toggleCategory(cat.id)}
                            />
                        ))}
                    </div>
                </Container>
            </Section>

            <SectionSeparator />

            {/* ── Betriebsübernahme ──────────────────────────────────────── */}
            <Section>
                <Container>
                    <Heading as="h2">Bestehenden Betrieb übernehmen?</Heading>
                    <Text>
                        Wenn Sie einen Betrieb mit aufrechter Genehmigung übernehmen, dürfen Sie ihn im Rahmen der bestehenden Genehmigung weiterführen – kein neues Verfahren nötig. Aber aufgepasst:
                    </Text>
                    <BreakPoint />

                    <AutoGrid min="15rem" gap="1.25rem">
                        {[
                            {
                                title: "Akteneinsicht nehmen",
                                body: "Der vor Ort vorgefundene Zustand muss nicht dem tatsächlich genehmigten entsprechen. Beim zuständigen Betriebsanlagenzentrum können Sie Akteneinsicht beantragen.",
                                Icon: BookOpen,
                                tone: "accentSoft" as const,
                            },
                            {
                                title: "Bescheide anfordern",
                                body: "Nach §79d GewO können Sie alle Genehmigungsbescheide anfordern. Frist: spätestens 6 Wochen nach Übernahme.",
                                Icon: FileText,
                                tone: "success" as const,
                            },
                            {
                                title: "Änderungen vorab klären",
                                body: "Planen Sie Änderungen? Sprechen Sie diese vor jeder Investition auf einem Projektsprechtag mit der Behörde ab.",
                                Icon: Package,
                                tone: "shield" as const,
                            },
                        ].map(({ title, body, Icon, tone }) => (
                            <Card key={title} variant="subtle">
                                <CardIcon tone={tone}>
                                    <Icon className="w-6 h-6" aria-hidden />
                                </CardIcon>
                                <CardTitle>{title}</CardTitle>
                                <CardBody>{body}</CardBody>
                            </Card>
                        ))}
                    </AutoGrid>
                </Container>
            </Section>

            <SectionSeparator />

            {/* ── Kontakte ───────────────────────────────────────────────── */}
            <Section>
                <Container>
                    <Heading as="h2">Zuständige Stellen in Wien</Heading>
                    <Text>
                        Geben Sie Ihre Bezirksnummer ein, um sofort die für Sie zuständigen Ämter zu sehen.
                    </Text>
                    <BreakPoint />

                    {/* District filter */}
                    <div className="flex flex-wrap items-center gap-3">
                        <input
                            type="number"
                            min={1}
                            max={23}
                            placeholder="Bezirk 1–23"
                            value={districtInput}
                            onChange={e => setDistrictInput(e.target.value)}
                            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] w-44 shadow-[var(--shadow-xs)]"
                            aria-label="Bezirksnummer eingeben"
                        />
                        {districtInput !== "" && !isValidDistrict && (
                            <span className="text-sm text-amber-600 font-medium">Bitte Bezirk 1–23 eingeben</span>
                        )}
                        {isValidDistrict && (
                            <span className="text-sm text-[var(--color-accent-strong)] font-semibold">
                                Zeige Stellen für Bezirk {districtNum}
                            </span>
                        )}
                        {districtInput && (
                            <Button variant="ghost" size="sm" onClick={() => setDistrictInput("")}>
                                Zurücksetzen
                            </Button>
                        )}
                    </div>

                    <BreakPoint />

                    {/* Tabs */}
                    <div
                        className="flex gap-1 rounded-[var(--radius-sm)] bg-slate-100 border border-[var(--color-border)] p-1 w-fit"
                        role="tablist"
                    >
                        {([
                            ["ma36", "MA 36 – Gewerbetechnik"],
                            ["mba", "Betriebsanlagenzentren"],
                        ] as const).map(([key, label]) => (
                            <button
                                key={key}
                                role="tab"
                                aria-selected={activeContactTab === key}
                                onClick={() => setActiveContactTab(key)}
                                className={clsx(
                                    "px-4 py-2 text-sm font-semibold rounded-[calc(var(--radius-sm)-2px)] transition-all duration-150",
                                    activeContactTab === key
                                        ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-xs)]"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-white"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <BreakPoint size="sm" />

                    {activeContactTab === "ma36" ? (
                        <div role="tabpanel">
                            <p className="text-base text-slate-600 mb-5 leading-7">
                                Die <strong>MA 36</strong> ist die gewerbetechnische Amtspartei – sie beurteilt Ihre Unterlagen fachlich und ist bei Projektsprechtagen Ihr Ansprechpartner.
                            </p>
                            <AutoGrid min="16rem" gap="1rem">
                                {ma36Filtered.map(c => <ContactCard key={c.name} {...c} />)}
                            </AutoGrid>
                            {ma36Filtered.length === 0 && (
                                <p className="text-base text-slate-500">Kein Eintrag für diesen Bezirk gefunden.</p>
                            )}
                            <div className="mt-5">
                                <a
                                    href="https://www.wien.gv.at/wirtschaft/betriebsanlagen"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-base text-[var(--color-accent)] hover:underline font-medium"
                                >
                                    MA 36 – Alle Kontakte <ArrowRight className="w-4 h-4" aria-hidden />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div role="tabpanel">
                            <p className="text-base text-slate-600 mb-5 leading-7">
                                Die <strong>Bezirksverwaltungsbehörden (MBA)</strong> nehmen Ihren Antrag entgegen und führen das Verfahren formell. <strong>Hier reichen Sie Ihre Unterlagen ein.</strong>
                            </p>
                            <AutoGrid min="16rem" gap="1rem">
                                {mbaFiltered.map(c => <ContactCard key={c.name} {...c} />)}
                            </AutoGrid>
                            {mbaFiltered.length === 0 && (
                                <p className="text-base text-slate-500">Kein Eintrag für diesen Bezirk gefunden.</p>
                            )}
                            <div className="mt-5">
                                <a
                                    href="https://www.wien.gv.at/mba/mba.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-base text-[var(--color-accent)] hover:underline font-medium"
                                >
                                    Alle Betriebsanlagenzentren <ArrowRight className="w-4 h-4" aria-hidden />
                                </a>
                            </div>
                        </div>
                    )}
                </Container>
            </Section>

            {/* ── CTA ────────────────────────────────────────────────────── */}
            <Container>
                <CtaPanel
                    title="Nicht sicher, was auf Sie zutrifft?"
                    text="Unser Compliance-Checker analysiert Ihr Vorhaben und erstellt eine maßgeschneiderte Übersicht der erforderlichen Unterlagen."
                    href={`/${locale}/compliance-checker`}
                    buttonLabel="Jetzt prüfen"
                />
            </Container>
        </>
    )
}
