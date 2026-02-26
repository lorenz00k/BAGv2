"use client"

import React, { useState, useEffect } from "react"
import clsx from "clsx"
import {
    FileText, CheckCircle2, Circle, ChevronDown, AlertTriangle,
    Building2, Shield, Wind, Thermometer, Volume2, Trash2, MapPin,
    Flame, Users, Phone, Mail, Info, BookOpen, ArrowRight,
    ClipboardList, Zap,
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
        copies: 1,
        why: "Der Antrag ist der formelle Start Ihres Genehmigungsverfahrens. Er enthält Ihre Kerndaten als Antragsteller und definiert den Gegenstand des Verfahrens.",
    },
    {
        id: "betriebsbeschreibung",
        title: "Betriebsbeschreibung",
        copies: 4,
        why: "Die Betriebsbeschreibung erklärt der Behörde genau, wie Ihr Betrieb funktioniert – was Sie tun, wann, mit welchen Mitteln und in welchem Umfang.",
    },
    {
        id: "maschinenverzeichnis",
        title: "Verzeichnis der Maschinen und Betriebseinrichtungen",
        copies: 4,
        why: "Das Verzeichnis listet alle technischen Geräte und Anlagen auf – inklusive ihrer Leistungs- und Emissionsdaten. Es ermöglicht der Behörde, mögliche Auswirkungen auf Nachbarn zu beurteilen.",
    },
    {
        id: "plaene",
        title: "Erforderliche Pläne und Skizzen",
        copies: 4,
        why: "Pläne zeigen den räumlichen Umfang der Anlage. Sie ermöglichen die Prüfung von Abständen zu Nachbarn, Brandabschnitten und Fluchtwegen.",
    },
    {
        id: "abfallwirtschaft",
        title: "Abfallwirtschaftskonzept",
        copies: 4,
        why: "Jede Betriebsanlage produziert Abfälle. Das Konzept zeigt, wie Sie diese verantwortungsvoll lagern, trennen und entsorgen – ein zentrales Umweltkriterium.",
    },
    {
        id: "technische-angaben",
        title: "Technische Angaben",
        copies: 1,
        why: "Diese Angaben ermöglichen der Behörde eine fachliche Beurteilung der zu erwartenden Emissionen (Lärm, Abgase, etc.) und ob Schutzmaßnahmen ausreichend sind.",
    },
    {
        id: "andere-rechtsvorschriften",
        title: "Projektunterlagen zu anderen Rechtsvorschriften",
        copies: null,
        why: "Falls Ihr Betrieb anderen Gesetzen unterliegt (z. B. Wasserrecht), müssen die entsprechenden Nachweise ebenfalls beigefügt werden. Anzahl und Art variieren je nach Projekt.",
    },
]

const CATEGORIES: Category[] = [
    {
        id: "allgemein",
        number: "4.2",
        title: "Allgemeine Anforderungen",
        Icon: Building2,
        tone: "default",
        why: "Diese Grundangaben geben der Behörde einen vollständigen Überblick über Ihren Betrieb – von der Lage über die Tätigkeiten bis zu den verwendeten Stoffen. Ohne diese Basis kann das Verfahren nicht starten.",
        items: [
            "Allgemeine Beschreibung der gesamten Betriebsanlage (Lage, Gebäude, räumlicher Umfang, gewerblich genutzte Flächen)",
            "Im Falle einer Änderung: Beschreibung aller geplanten Änderungen",
            "Beschreibung der geplanten betrieblichen Tätigkeiten (Produktion, Verkauf, Verfahren, Arbeitsschritte)",
            "Beschreibung der elektrischen Anlage(n)",
            "Angabe der Betriebszeiten, Öffnungszeiten und Anlieferungszeiten",
            "Technische Beschreibung von maschinellen Anlagen (z. B. Lüftung, Kälte, Produktion)",
            "Verzeichnis der verwendeten betrieblichen Stoffe (Chemikalien, brennbare Flüssigkeiten) mit Gebindegröße und Lagerort",
        ],
    },
    {
        id: "brandschutz",
        number: "4.3",
        title: "Brandschutztechnische Angaben",
        Icon: Flame,
        tone: "warm",
        why: "Brandschutz ist gesetzlich vorgeschrieben, um Leben zu schützen. Die Behörde prüft, ob Brandabschnitte, Löschmittel, Fluchtwege und Beleuchtung den Vorschriften entsprechen – für Ihre Mitarbeiter und Nachbarn.",
        items: [
            "Beschreibung der brandschutztechnischen Ausführungen (Brandabschnitte, Brandwiderstandsklassen wie EI 90)",
            "Angabe der Gebäudeklasse (bei größeren Betriebsobjekten)",
            "Angabe der vorgesehenen Ersten Löschhilfe",
            "Beschreibung geplanter brandschutztechnischer Anlagen (Brandmeldeanlage, Sprinkler, Rauchabzüge)",
            "Angaben zum organisatorischen Brandschutz (Brandschutzbeauftragter, Brandschutzordnung)",
            "Beschreibung der Ausführung der Sicherheitsbeleuchtung",
        ],
    },
    {
        id: "lueftung",
        number: "4.4.1",
        title: "Lüftungsanlagen",
        Icon: Wind,
        tone: "accentSoft",
        why: "Lüftungsanlagen können Gerüche und Lärm zu Nachbarn übertragen. Die Behörde prüft daher genau, wie und wohin die Luft geführt wird und ob Emissionen zumutbar sind.",
        items: [
            "Technische Lüftungsbeschreibung",
            "Lüftungsbilanz (Zu- und Abluftvolumina je Anlage und Raum)",
            "Situierung von Ansaug- und Fortluftstellen",
            "Schallemissionen der Ventilatoren in dB(A) mit Entfernungsangabe",
            "Schallemissionen von Fortluft- und Ansaugstellen sowie Entfernung zum nächsten Nachbar",
            "Volumenstrom (m³/h), Luftgeschwindigkeit (m/s) und Luftfilter",
            "Durchmesser der Lüftungskanäle und Strömungsgeschwindigkeiten",
            "Geruchsmindernde Maßnahmen (UV-C-Anlage, Ozongenerator, Aktivkohlefilter) – falls vorhanden: mit Datenblatt und Dimensionierung",
        ],
    },
    {
        id: "kaelte-heizung",
        number: "4.4.2–3",
        title: "Kälte- & Heizungsanlagen",
        Icon: Thermometer,
        tone: "success",
        why: "Kälte- und Heizungsanlagen erzeugen Lärm und nutzen mitunter umweltrelevante Kältemittel. Die Behörde prüft Schallemissionen, Kältemittelmengen und die Sicherheit der Anlagen.",
        items: [
            "Beschreibung der Kälteanlage (direkte/indirekte Kühlung, Situierung der Rückkühler)",
            "Angabe der versorgten Kühlstellen und deren Aufstellort",
            "Kältemittelart und -menge (inkl. Leitungsnetz)",
            "Schallemissionen der Rückkühler und Entfernung zum nächsten Nachbar",
            "Art der Beheizung der Betriebsanlage",
            "Angaben zu Heizungsanlagenteilen (Pufferspeicher, Ausdehnungsgefäß)",
            "Wärmeverteilung (Radiatoren, Fußbodenheizung, Umlufterhitzer)",
            "Bei Pelletsanlage: Nennwärmeleistung, Brennstofflager, Abgasabführung, Sicherheitseinrichtungen",
        ],
    },
    {
        id: "emissionen",
        number: "4.5",
        title: "Emissionserklärung",
        Icon: Volume2,
        tone: "warm",
        why: "Emissionen sind oft der Hauptgrund für Nachbarschaftskonflikte und behördliche Auflagen. Eine vollständige Emissionserklärung zeigt, dass Ihr Betrieb zumutbare Grenzwerte einhält.",
        items: [
            "Schallemissionen als Schallleistungspegel in dB(A) oder Dauerschallpegel mit Entfernungsangabe",
            "Entfernung zwischen Emissionsstellen und nächstgelegenen Nachbarn (Fenster, Terrassen)",
            "Schallemissionen von Musikanlagen (Betriebszeiten, geplante Lautstärke, Messort)",
            "Schallemissionen durch Anlieferungen und Warentransport (innen und außen)",
            "Schallschutzmaßnahmen: Schallschutzhauben, Vorsatzschalen, bauliche Maßnahmen",
            "Staubemissionen bei Manipulation von Baustoffen oder Waren im Freien",
            "Anfallende Abwässer und deren Aufbereitung und Entsorgung",
            "Beschreibung von Mineralöl- oder Fettabscheidern (falls geplant) inkl. Kanalplan",
            "Geruchsemissionen in GE/h – jedenfalls erforderlich bei Betrieben mit Holzkohlegriller",
        ],
    },
    {
        id: "arbeitnehmerschutz",
        number: "4.6",
        title: "Arbeitnehmerschutz",
        Icon: Users,
        tone: "shield",
        why: "Der Schutz Ihrer Mitarbeiter hat oberste Priorität. Die Behörde prüft Arbeitsbedingungen, Sanitäranlagen, Sichtverbindungen ins Freie und ob Arbeitsmittel sicher genutzt werden können.",
        items: [
            "Anzahl der Beschäftigten (gesamt und maximal gleichzeitig anwesend)",
            "Beschreibung der Arbeitsvorgänge",
            "Rechnerischer Nachweis ausreichender Lichteintrittsflächen und Sichtverbindung ins Freie",
            "Zur Verwendung gelangende Arbeitsmittel",
            "Beschreibung der Sanitäranlagen sowie Umkleide- und Duschmöglichkeiten",
            "Beschreibung der ständigen Arbeitsbereiche (z. B. Kommissionierungsbereiche in Lagerhallen)",
        ],
    },
    {
        id: "plaene-zeichnungen",
        number: "4.7",
        title: "Pläne & Zeichnungen",
        Icon: MapPin,
        tone: "accentSoft",
        why: "Pläne sind die visuelle Sprache im Genehmigungsverfahren. Sie müssen vollständig, korrekt bemaßt und leserlich sein – Sachverständige und Behörde arbeiten ausschließlich damit.",
        items: [
            "Lageplan mit eindeutiger Darstellung der Betriebsanlage und Abständen zu Nachbarn",
            "Grundrisspläne mit Maßstabsangabe",
            "Betriebsanlagengrenzen und Brandabschnittsgrenzen (z. B. EI 90) eindeutig dargestellt",
            "Raumwidmungen, Raumgrößen, Raumhöhen und Fußbodenoberflächen",
            "Bemaßung von Türen, Fenstern, Treppen und Einzelstufen (Höhe und Tiefe)",
            "Handläufe, Absturzsicherungen und Verglasungsart (ESG/VSG) vermerkt",
            "Fluchtwege mit Breiten und Notausgänge mit maximaler Personenanzahl",
            "Maschinenaufstellplan mit Positionsnummern (oder als eigenständiger Plan)",
            "Lüftungsplan (bei vorhandenen Lüftungsanlagen): Kanäle, Aggregate, Schalldämpfer, Ansaug- und Fortluftstellen",
        ],
    },
    {
        id: "explosionsschutz",
        number: "4.8",
        title: "Explosionsschutz",
        Icon: Zap,
        tone: "warm",
        conditional: true,
        why: "Wenn in Ihrem Betrieb Staub (z. B. Bäckereien, Tischlereien) oder brennbare Gase entstehen, muss eine Explosionsschutzbetrachtung belegen, dass keine Gefahr für Personen besteht.",
        items: [
            "Betrachtung zum Explosionsschutz bei Staubentstehung (z. B. Bäckereien, Tischlereien, Holzverarbeitung)",
            "Betrachtung zum Explosionsschutz bei brennbaren Gasen, Dämpfen oder Nebeln",
        ],
    },
    {
        id: "abfall",
        number: "4.9",
        title: "Abfallwirtschaftskonzept",
        Icon: Trash2,
        tone: "success",
        why: "Das Abfallwirtschaftskonzept ist Pflichtbestandteil jeder Neugenehmigung und wesentlichen Änderung. Es zeigt, wie Ihr Betrieb verantwortungsvoll mit entstehenden Abfällen umgeht.",
        items: [
            "Beschreibung und Angabe der anfallenden Abfälle (Abfallart, erwartete Menge, Schlüsselnummer)",
            "Zwischenlagerung der Abfälle",
            "Entsorgungsweg für jeden Abfalltyp",
            "Geplante Maßnahmen zur Reduktion der anfallenden Abfallmengen",
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

function CopyBadge({ copies }: { copies: number | null }) {
    if (copies === null) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-slate-500">
                je nach Projekt
            </span>
        )
    }
    return (
        <span className={clsx(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold",
            copies === 1
                ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--color-accent)_10%,var(--color-surface))] text-[var(--color-accent-strong)] border border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
        )}>
            {copies}×
        </span>
    )
}

function ProgressBar({ checked, total }: { checked: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((checked / total) * 100)
    const allDone = pct === 100
    return (
        <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3 shadow-[var(--shadow-xs)]">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">
                    {checked} von {total} Pflichtdokumenten vorbereitet
                </span>
                <span className={clsx(
                    "text-lg font-bold tabular-nums",
                    allDone ? "text-[var(--color-accent)]" : "text-slate-500"
                )}>
                    {pct}&thinsp;%
                </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={clsx(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        allDone ? "bg-[var(--color-accent)]" : "bg-[var(--color-accent)]"
                    )}
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
            {allDone && (
                <p className="text-sm font-medium text-[var(--color-accent-strong)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" aria-hidden />
                    Alle Pflichtdokumente sind bereit – Sie können den Antrag einreichen!
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
            <div className="text-sm leading-6 text-slate-700">{children}</div>
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
            "rounded-[var(--radius-sm)] border transition-all duration-200",
            checked
                ? "bg-[var(--color-accent-soft)] border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]"
                : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[color-mix(in_srgb,var(--color-accent)_30%,var(--color-border))]"
        )}>
            <div className="flex items-start gap-3 p-4">
                <button
                    onClick={onToggle}
                    className="flex-shrink-0 mt-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] rounded"
                    aria-label={checked ? `${doc.title} als nicht erledigt markieren` : `${doc.title} als erledigt markieren`}
                >
                    {checked
                        ? <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)]" aria-hidden />
                        : <Circle className="w-5 h-5 text-slate-300" aria-hidden />
                    }
                </button>

                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={clsx(
                            "font-medium text-sm transition-colors",
                            checked ? "text-slate-400 line-through" : "text-slate-800"
                        )}>
                            {doc.title}
                        </span>
                        <CopyBadge copies={doc.copies} />
                    </div>

                    {showWhy && (
                        <p className="text-xs text-slate-600 leading-5 pt-1">{doc.why}</p>
                    )}
                </div>

                <button
                    onClick={() => setShowWhy(v => !v)}
                    className={clsx(
                        "flex-shrink-0 flex items-center gap-1 text-xs transition-colors mt-0.5 px-2 py-1 rounded",
                        showWhy
                            ? "text-[var(--color-accent-strong)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]"
                            : "text-slate-400 hover:text-[var(--color-accent)]"
                    )}
                    aria-label={showWhy ? "Erklärung ausblenden" : "Warum wird dieses Dokument benötigt?"}
                >
                    <Info className="w-3.5 h-3.5" aria-hidden />
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
                : "border-[var(--color-border)] hover:border-[color-mix(in_srgb,var(--color-accent)_20%,var(--color-border))]"
        )}>
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] rounded-[var(--radius)]"
                aria-expanded={isOpen}
            >
                <div className={clsx(
                    "w-10 h-10 rounded-[var(--radius-sm)] grid place-items-center flex-shrink-0",
                    iconToneClasses[tone]
                )}>
                    <Icon className="w-5 h-5" aria-hidden />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono text-slate-400 tracking-wide">{category.number}</span>
                        <span className="font-semibold text-slate-800 text-sm">{category.title}</span>
                        {category.conditional && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                nur bei Bedarf
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {category.items.length} {category.items.length === 1 ? "Angabe" : "Angaben"} erforderlich
                    </p>
                </div>

                <ChevronDown className={clsx(
                    "w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                )} aria-hidden />
            </button>

            {isOpen && (
                <div className="px-5 pb-5 space-y-4">
                    <div className="rounded-[var(--radius-sm)] px-4 py-3 bg-[var(--color-accent-soft)] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
                        <p className="text-sm text-slate-700 leading-6">
                            <span className="font-semibold text-[var(--color-accent-strong)]">Warum? </span>
                            {category.why}
                        </p>
                    </div>

                    <ul className="space-y-2.5" role="list">
                        {category.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-5">
                                <div className="w-5 h-5 rounded-full bg-[var(--color-accent-soft)] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] grid place-items-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-[var(--color-accent-strong)]">{idx + 1}</span>
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
        <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3 shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] hover:border-[color-mix(in_srgb,var(--color-accent)_20%,var(--color-border))] transition-all duration-200">
            <div>
                <h4 className="font-semibold text-slate-800">{name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Bezirke: {districts}</p>
            </div>
            <div className="space-y-2">
                <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)] rounded"
                >
                    <Mail className="w-4 h-4 flex-shrink-0" aria-hidden />
                    <span className="truncate">{email}</span>
                </a>
                <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
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
                        title="Einreichunterlagen für Betriebsanlagen"
                        subtitle="Alle Dokumente, die Sie für Ihre gewerbebehördliche Genehmigung (MA 36) benötigen – übersichtlich erklärt, mit Checkliste und Kontakten."
                        as="h1"
                        subtitleAs="p"
                    />
                    <BreakPoint />

                    <AutoGrid min="9rem" gap="1rem">
                        {([
                            { label: "Pflichtdokumente", value: "7", Icon: FileText, tone: "accentSoft" },
                            { label: "Themenbereiche", value: "9", Icon: ClipboardList, tone: "success" },
                            { label: "Kopien (max.)", value: "4×", Icon: BookOpen, tone: "warm" },
                            { label: "Zuständige Stellen", value: "4", Icon: Building2, tone: "shield" },
                        ] as const).map(({ label, value, Icon, tone }) => (
                            <div
                                key={label}
                                className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col items-center justify-center gap-2 text-center shadow-[var(--shadow-xs)]"
                            >
                                <CardIcon tone={tone}>
                                    <Icon className="w-5 h-5" aria-hidden />
                                </CardIcon>
                                <span className="text-2xl font-bold text-slate-800 tabular-nums">{value}</span>
                                <span className="text-xs text-slate-500">{label}</span>
                            </div>
                        ))}
                    </AutoGrid>
                </Container>
            </Section>

            <SectionSeparator />

            {/* ── Was ist eine Betriebsanlagengenehmigung? ──────────────── */}
            <Section>
                <Container>
                    <Heading as="h2">Was ist eine Betriebsanlagengenehmigung?</Heading>
                    <Text>
                        Eine gewerbliche Betriebsanlage ist jede örtlich gebundene Einrichtung, die der regelmäßigen Ausübung einer gewerblichen Tätigkeit dient. Die Genehmigung ist <strong>dinglich</strong> – sie gilt für das Objekt, nicht für den Betreiber. Bei Besitzerwechsel, Weiterverpachtung oder Verkauf bleibt die Genehmigung gültig.
                    </Text>
                    <Text>
                        Die Genehmigung muss <strong>vor Errichtung und Betrieb</strong> eingeholt werden und ist unabhängig vom Vorliegen einer Gewerbeberechtigung.
                    </Text>

                    <BreakPoint />
                    <InfoCallout variant="warning">
                        <strong>Wichtig:</strong> Ein Mietvertrag oder der Erwerb von Betriebsflächen und Anlagen <em>vor</em> der Genehmigung ist nicht erforderlich. Jede Investition vor der Genehmigung erfolgt auf <strong>eigenes Risiko</strong> – erst im Verfahren wird geprüft, ob die Anlage überhaupt genehmigungsfähig ist.
                    </InfoCallout>

                    <BreakPoint />
                    <Heading as="h3">Wann brauche ich eine Genehmigung?</Heading>
                    <Text>
                        Eine Genehmigung nach §74 Abs. 2 GewO ist erforderlich, wenn Ihre Betriebsanlage geeignet ist:
                    </Text>
                    <ul className="mt-4 space-y-2.5" role="list">
                        {[
                            "das Leben oder die Gesundheit von Gewerbetreibenden, Nachbarn oder Kunden zu gefährden",
                            "Nachbarn durch Geruch, Lärm, Rauch, Staub, Erschütterung oder in anderer Weise zu belästigen",
                            "den Betrieb von Kirchen, Schulen, Kranken- oder Kuranstalten zu beeinträchtigen",
                            "die Sicherheit, Leichtigkeit und Flüssigkeit des Verkehrs wesentlich zu beeinträchtigen",
                            "eine nachteilige Einwirkung auf die Beschaffenheit der Gewässer herbeizuführen",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-5">
                                <div className="w-5 h-5 rounded-full bg-[var(--color-accent-soft)] border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)] grid place-items-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-[var(--color-accent-strong)]">{i + 1}</span>
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </Container>
            </Section>

            <SectionSeparator />

            {/* ── Pflichtdokumente Checklist ─────────────────────────────── */}
            <Section>
                <Container>
                    <Heading as="h2">Gesetzliche Pflichtdokumente nach §353 GewO</Heading>
                    <Text>
                        Diese Unterlagen sind <strong>immer einzureichen</strong> – unabhängig von der Art oder Größe Ihrer Betriebsanlage. Klicken Sie auf <em>Warum?</em> um zu verstehen, wozu das jeweilige Dokument dient.
                    </Text>
                    <BreakPoint />

                    {mounted && (
                        <ProgressBar
                            checked={checkedIds.size}
                            total={MANDATORY_DOCS.length}
                        />
                    )}
                    <BreakPoint size="sm" />

                    <div className="space-y-2.5" role="list">
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
                    <div className="flex items-start gap-2 text-xs text-slate-400">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden />
                        <span>
                            Die Zahl der Kopien (×) ist gesetzlich festgelegt. Ihr Fortschritt wird lokal im Browser gespeichert.
                        </span>
                    </div>
                </Container>
            </Section>

            <SectionSeparator />

            {/* ── Projektunterlagen (Accordion) ──────────────────────────── */}
            <Section>
                <Container>
                    <Heading as="h2">Projektunterlagen nach Themenbereichen</Heading>
                    <Text>
                        Zusätzlich zu den Pflichtdokumenten sind je nach Art und Umfang Ihres Projekts spezifische Angaben erforderlich. Klappen Sie die Bereiche auf, um zu sehen, was konkret verlangt wird – und <strong>warum</strong>.
                    </Text>
                    <BreakPoint />
                    <InfoCallout>
                        Das erforderliche Ausmaß und die Detailtiefe variieren je nach Projektgröße. Klären Sie die genauen Anforderungen für Ihr konkretes Vorhaben auf einem der <strong>Projektsprechtage</strong> der MA 36.
                    </InfoCallout>
                    <BreakPoint />

                    <div className="flex gap-2 mb-4">
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

                    <div className="space-y-2.5">
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

            {/* ── Übernahme ──────────────────────────────────────────────── */}
            <Section>
                <Container>
                    <Heading as="h2">Übernahme eines bestehenden Betriebes</Heading>
                    <Text>
                        Wird ein Betrieb mit aufrechter Genehmigung übernommen, darf der Rechtsnachfolger (Mieter, Pächter, Käufer) die Anlage <strong>im Umfang der bestehenden Genehmigung</strong> weiterbetreiben – ohne neues Verfahren.
                    </Text>
                    <BreakPoint />

                    <AutoGrid min="15rem" gap="1.25rem">
                        {[
                            {
                                title: "Akteneinsicht empfohlen",
                                body: "Nehmen Sie Akteneinsicht beim zuständigen Betriebsanlagenzentrum, um den tatsächlich genehmigten Umfang zu kennen. Der vor Ort vorgefundene Zustand muss nicht immer dem genehmigten entsprechen.",
                                Icon: BookOpen,
                                tone: "accentSoft" as const,
                            },
                            {
                                title: "Bescheide anfordern (§79d GewO)",
                                body: "Sie können eine Zusammenstellung aller Genehmigungsbescheide beantragen. Antrag muss spätestens 6 Wochen nach der Übernahme gestellt werden.",
                                Icon: FileText,
                                tone: "success" as const,
                            },
                            {
                                title: "Änderungen vorab klären",
                                body: "Sind nach der Übernahme Änderungen geplant (z. B. andere Geräte, neue Lüftung)? Klären Sie diese vorab auf einem Projektsprechtag, bevor Sie investieren.",
                                Icon: Shield,
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
                        Geben Sie Ihre Bezirksnummer ein, um die für Sie zuständigen Ämter zu finden.
                    </Text>
                    <BreakPoint />

                    {/* District filter */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <input
                                type="number"
                                min={1}
                                max={23}
                                placeholder="Bezirk 1–23"
                                value={districtInput}
                                onChange={e => setDistrictInput(e.target.value)}
                                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] w-40 shadow-[var(--shadow-xs)]"
                                aria-label="Bezirksnummer eingeben"
                            />
                        </div>
                        {districtInput !== "" && !isValidDistrict && (
                            <span className="text-xs text-amber-600 font-medium">Bitte Bezirk 1–23 eingeben</span>
                        )}
                        {isValidDistrict && (
                            <span className="text-xs text-[var(--color-accent-strong)] font-medium">
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

                    {/* Tab switcher */}
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
                                    "px-4 py-2 text-sm font-medium rounded-[calc(var(--radius-sm)-2px)] transition-all duration-150",
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
                            <p className="text-sm text-slate-600 mb-4 leading-6">
                                Die <strong>MA 36</strong> ist die gewerbetechnische Amtspartei und beurteilt Ihre Einreichunterlagen fachlich. Sie ist bei Projektsprechtagen und technischen Rückfragen Ihr Ansprechpartner.
                            </p>
                            <AutoGrid min="16rem" gap="1rem">
                                {ma36Filtered.map(c => <ContactCard key={c.name} {...c} />)}
                            </AutoGrid>
                            {ma36Filtered.length === 0 && (
                                <p className="text-sm text-slate-500">Kein Eintrag für diesen Bezirk gefunden.</p>
                            )}
                            <div className="mt-5">
                                <a
                                    href="https://www.wien.gv.at/kontakte/ma36/index.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline font-medium"
                                >
                                    MA 36 – Alle Kontakte <ArrowRight className="w-4 h-4" aria-hidden />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div role="tabpanel">
                            <p className="text-sm text-slate-600 mb-4 leading-6">
                                Die <strong>Bezirksverwaltungsbehörden (MBA)</strong> nehmen Ihren Antrag entgegen und führen das Genehmigungsverfahren formell. Hier reichen Sie Ihre Unterlagen ein.
                            </p>
                            <AutoGrid min="16rem" gap="1rem">
                                {mbaFiltered.map(c => <ContactCard key={c.name} {...c} />)}
                            </AutoGrid>
                            {mbaFiltered.length === 0 && (
                                <p className="text-sm text-slate-500">Kein Eintrag für diesen Bezirk gefunden.</p>
                            )}
                            <div className="mt-5">
                                <a
                                    href="https://www.wien.gv.at/mba/mba.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline font-medium"
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
                    title="Unsicher, welche Dokumente Sie brauchen?"
                    text="Unser Compliance-Checker analysiert Ihr Vorhaben und erstellt eine maßgeschneiderte Übersicht der erforderlichen Unterlagen."
                    href={`/${locale}/compliance-checker`}
                    buttonLabel="Jetzt prüfen"
                />
            </Container>
        </>
    )
}
