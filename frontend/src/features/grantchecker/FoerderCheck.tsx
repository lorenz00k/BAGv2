"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Building2,
  Users,
  MapPin,
  Clock,
  BadgePercent,
  Sparkles,
  ExternalLink,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

type Answer = "yes" | "no" | null;
type AnswersState = Record<string, Answer>;

interface Question {
  id: string;
  category: string;
  icon: React.ReactNode;
  question: string;
  subtext: string;
  hint: string;
  ko_if: "yes" | "no" | null;
  ko_reason?: string;
  isBonus?: boolean;
  bonusLabel?: string;
}

type KOResult = { success: false; koQuestion: Question };
type SuccessResult = {
  success: true;
  quote: number;
  grantAmount: number;
  hasLeerstand: boolean;
  hasZielgebiet: boolean;
  hasBonus: boolean;
};
type CheckResult = KOResult | SuccessResult;

const QUESTIONS: Question[] = [
  {
    id: "is_kleinunternehmen",
    category: "Unternehmen",
    icon: <Users className="w-5 h-5" />,
    question: "Ist dein Betrieb ein Klein- oder Kleinstunternehmen?",
    subtext:
      "Kleinstunternehmen: unter 10 Mitarbeiter, max. € 2 Mio. Jahresumsatz · Kleinunternehmen: unter 50 Mitarbeiter, max. € 10 Mio. Jahresumsatz.",
    hint: "Die Förderung richtet sich ausschließlich an Wiener Klein- und Kleinstunternehmen.",
    ko_if: "no",
    ko_reason:
      "Die Förderung ist ausschließlich für Klein- und Kleinstunternehmen reserviert. Mittlere und große Unternehmen sind leider nicht antragsberechtigt.",
  },
  {
    id: "is_erdgeschoss",
    category: "Standort",
    icon: <Building2 className="w-5 h-5" />,
    question:
      "Liegt dein (geplantes) Lokal in Wien, im Erdgeschoß und hat direkten Kundenkontakt?",
    subtext:
      "z.B. Einzelhandel, Gastronomie, Gewerbe mit Laufkundschaft — Franchise-Betriebe, reine Automatenshops und Online-Only-Shops sind ausgeschlossen.",
    hint: "Persönliche Betreuung vor Ort ist Pflicht. Reine Digital- oder Lieferbetriebe ohne Ladenlokal sind nicht förderfähig.",
    ko_if: "no",
    ko_reason:
      "Das Lokal muss sich in Wien, im Erdgeschoß befinden und regulären Kundenverkehr haben. Franchise-Konzepte und Betriebe ohne persönliche Betreuung vor Ort sind explizit ausgeschlossen.",
  },
  {
    id: "is_not_started",
    category: "Projektstatus",
    icon: <Clock className="w-5 h-5" />,
    question:
      "Hast du mit den geplanten Investitionen (Umbau, Anschaffungen etc.) noch NICHT begonnen?",
    subtext:
      "Investitionen dürfen erst nach der offiziellen Förderzusage gestartet werden. Bereits begonnene oder abgeschlossene Maßnahmen sind nicht förderbar.",
    hint: "Wichtig: Kein Spatenstich, keine Bestellung, keine Beauftragung vor der Zusage!",
    ko_if: "no",
    ko_reason:
      "Projekte, die vor der Förderzusage gestartet wurden, sind leider vollständig von der Förderung ausgeschlossen. Stelle den Antrag, bevor du mit irgendeiner Maßnahme beginnst.",
  },
  {
    id: "is_leerstand",
    category: "Bonus",
    icon: <BadgePercent className="w-5 h-5" />,
    question:
      "Stand das Lokal nachweislich seit mindestens 6 Monaten ununterbrochen leer?",
    subtext:
      "Erforderliche Nachweise: offizielle Leerstandsbestätigung, Miet- oder Kaufvertrag sowie Fotos des Lokals.",
    hint: "Dieser Bonus hebt deine Förderquote von 25 % auf 35 %!",
    ko_if: null,
    isBonus: true,
    bonusLabel: "+10 % Förderquote",
  },
  {
    id: "is_zielgebiet",
    category: "Bonus",
    icon: <MapPin className="w-5 h-5" />,
    question:
      "Liegt das Lokal in dem Bezirk Ottakring?",
    subtext:
      "Die genauen Zielgebiete sind auf der Website der Wirtschaftsagentur Wien kartografisch dargestellt.",
    hint: "Auch dieser Bonus erhöht deine Förderquote auf 35 %.",
    ko_if: null,
    isBonus: true,
    bonusLabel: "+10 % Förderquote",
  },
];

const formatEuro = (amount: number) =>
  new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function FoerderCheck() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [showResult, setShowResult] = useState(false);
  const [projectCost, setProjectCost] = useState(20000);
  const [visible, setVisible] = useState(true);

  const goToStep = (newStep: number) => {
    setVisible(false);
    setTimeout(() => {
      setStep(newStep);
      setVisible(true);
    }, 150);
  };

  const handleAnswer = (answer: Answer) => {
    const currentQ = QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(newAnswers);

    if (currentQ.ko_if === answer) {
      setShowResult(true);
      return;
    }

    if (step < QUESTIONS.length - 1) {
      goToStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const goBack = () => {
    if (step > 0) goToStep(step - 1);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
    setProjectCost(20000);
    setVisible(true);
  };

  const calculateResult = (): CheckResult => {
    const koQuestion = QUESTIONS.find(
      (q) => q.ko_if !== null && answers[q.id] === q.ko_if
    );
    if (koQuestion) return { success: false, koQuestion };

    const hasLeerstand = answers["is_leerstand"] === "yes";
    const hasZielgebiet = answers["is_zielgebiet"] === "yes";
    const hasBonus = hasLeerstand || hasZielgebiet;
    const quote = hasBonus ? 0.35 : 0.25;
    const grantAmount = Math.min(Math.floor(projectCost * quote), 20000);

    return { success: true, quote, grantAmount, hasLeerstand, hasZielgebiet, hasBonus };
  };

  const result: CheckResult | null = showResult ? calculateResult() : null;
  const progressPercent = ((step + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[step];

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          Wirtschaftsagentur Wien · 2026
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Lebendiges Grätzl
        </h1>
        <p className="text-gray-500 text-lg">
          In 5 Schritten prüfen, ob du bis zu{" "}
          <span className="font-semibold text-gray-700">€ 20.000</span>{" "}
          Förderung erhalten kannst.
        </p>
      </div>

      {/* Question Card */}
      {!showResult && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-8">
            {/* Step dots */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-2 items-center">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i < step
                        ? "bg-blue-400 w-2"
                        : i === step
                        ? "bg-blue-500 w-6"
                        : "bg-gray-200 w-2"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400 font-medium tabular-nums">
                {step + 1} / {QUESTIONS.length}
              </span>
            </div>

            {/* Animated question body */}
            <div
              className="transition-opacity duration-150"
              style={{ opacity: visible ? 1 : 0 }}
            >
              {/* Category + icon */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    currentQ.isBonus
                      ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {currentQ.icon}
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {currentQ.category}
                </span>
                {currentQ.isBonus && (
                  <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                    Bonus-Frage
                  </span>
                )}
              </div>

              {/* Question */}
              <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
                {currentQ.question}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {currentQ.subtext}
              </p>

              {/* Hint box */}
              <div
                className={`flex items-start gap-3 p-4 rounded-2xl mb-8 text-sm ${
                  currentQ.isBonus
                    ? "bg-amber-50 border border-amber-100 text-amber-800"
                    : "bg-blue-50 border border-blue-100 text-blue-800"
                }`}
              >
                {currentQ.isBonus ? (
                  <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                )}
                <span>{currentQ.hint}</span>
                {currentQ.bonusLabel && (
                  <span className="ml-auto font-bold text-amber-700 whitespace-nowrap pl-3">
                    {currentQ.bonusLabel}
                  </span>
                )}
              </div>

              {/* Answer buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAnswer("yes")}
                  className="group flex items-center justify-center gap-2.5 p-4 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 active:scale-95 transition-all font-semibold text-gray-700 hover:text-green-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                  Ja
                </button>
                <button
                  onClick={() => handleAnswer("no")}
                  className="group flex items-center justify-center gap-2.5 p-4 border-2 border-gray-200 rounded-2xl hover:border-red-400 hover:bg-red-50 active:scale-95 transition-all font-semibold text-gray-700 hover:text-red-700"
                >
                  <XCircle className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
                  Nein
                </button>
              </div>

              {step > 0 && (
                <button
                  onClick={goBack}
                  className="mt-5 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {showResult && result?.success && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">Du könntest einreichen!</h2>
            <p className="text-emerald-100 text-lg">
              Du erfüllst grundsätzlich ertsmal alle Grundvoraussetzungen für die Förderung.
            </p>
          </div>

          <div className="p-8">
            {/* Bonus badges */}
            {(result.hasLeerstand || result.hasZielgebiet) && (
              <div className="flex gap-3 mb-6 flex-wrap">
                {result.hasLeerstand && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
                    <BadgePercent className="w-4 h-4" />
                    Leerstandsbonus aktiv
                  </div>
                )}
                {result.hasZielgebiet && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
                    <MapPin className="w-4 h-4" />
                    Zielgebietsbonus aktiv
                  </div>
                )}
              </div>
            )}

            {/* Cost calculator */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Geschätzte Projektkosten
                </span>
                <span className="font-bold text-gray-900 tabular-nums">
                  {formatEuro(projectCost)}
                </span>
              </div>
              <input
                type="range"
                min={7500}
                max={80000}
                step={500}
                value={projectCost}
                onChange={(e) => setProjectCost(Number(e.target.value))}
                className="w-full accent-blue-500 my-3"
              />
              <div className="flex justify-between text-xs text-gray-400 mb-5">
                <span>Min. € 7.500</span>
                <span>€ 80.000</span>
              </div>

              <div className="h-px bg-gray-200 mb-5" />

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Voraussichtliche Förderung
                  </div>
                  <div className="text-xs text-gray-400">
                    {result.quote * 100} % Förderquote
                    {result.hasBonus ? " (mit Bonus)" : " (Basis)"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-emerald-600 tabular-nums">
                    {formatEuro(result.grantAmount)}
                  </div>
                  {result.grantAmount >= 20000 && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Maximalbetrag erreicht
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Key facts grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Antragszeitraum</div>
                <div className="font-semibold text-gray-800">
                  01.03. – 31.12.2026
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">
                  Mindest-Projektwert
                </div>
                <div className="font-semibold text-gray-800">€ 7.500</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Projektlaufzeit</div>
                <div className="font-semibold text-gray-800">Max. 2 Jahre</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Einreichung</div>
                <div className="font-semibold text-gray-800">
                  Online · Wettbewerb
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wirtschaftsagentur.at/aktuelle-foerderungen-der-wirtschaftsagentur-wien/foerderung-lebendiges-graetzl/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 px-5 rounded-2xl transition-all"
              >
                Jetzt beantragen
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-5 py-3.5 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Neu starten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KO Result */}
      {showResult && result && !result.success && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-rose-500 to-red-600 p-8 text-white text-center">
            <XCircle className="w-14 h-14 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">Leider nicht förderfähig</h2>
            <p className="text-rose-100 text-lg">
              Ein Ausschlusskriterium wurde nicht erfüllt.
            </p>
          </div>

          <div className="p-8">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  {result.koQuestion.icon}
                </div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                  {result.koQuestion.category}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {result.koQuestion.ko_reason}
              </p>
            </div>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Die Wirtschaftsagentur Wien bietet eine Reihe weiterer Förderprogramme an —
              möglicherweise ist ein anderes Programm besser auf deine Situation zugeschnitten.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wirtschaftsagentur.at"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 active:scale-95 text-white font-semibold py-3.5 px-5 rounded-2xl transition-all"
              >
                Alle Förderungen ansehen
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-5 py-3.5 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Neu starten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info strip */}
      {!showResult && (
        <div className="mt-6 flex justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <span>Nicht rückzahlbarer Zuschuss</span>
          <span>·</span>
          <span>bis zu € 20.000</span>
          <span>·</span>
          <span>Antrag ab 01.03.2026</span>
        </div>
      )}
    </div>
  );
}
