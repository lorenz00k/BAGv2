"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Volume2,
  Waves,
  Shield,
} from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiError } from "@/services/api";
import type { AddressSuggestion, ViennaGISResult } from "@/types/viennagis";

import AddressSearch from "./AddressSearch";
import ConflictPanel from "./cards/ConflictPanel";
import InsightCard from "./cards/InsightCard";
import OverallRiskBanner from "./cards/OverallRiskBanner";
import POIList from "./cards/POIList";
import { checkAddress } from "@/services/viennagis";

// Lazy-load the map (it imports maplibre-gl which is a large client-only lib)
const GISMap = dynamic(() => import("./map/GISMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-400 items-center justify-center rounded-lg bg-(--color-surface) text-(--color-muted)">
      Karte wird geladen...
    </div>
  ),
});

// ---------------------------------------------------------------------------
// State machine — makes impossible states impossible
// ---------------------------------------------------------------------------

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ViennaGISResult };

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const cardStack = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const cardItem = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ---------------------------------------------------------------------------
// Feature pills config
// ---------------------------------------------------------------------------

const FEATURES = [
  { icon: Building2, key: "zoning" },
  { icon: Volume2, key: "noise" },
  { icon: Waves, key: "flood" },
  { icon: Shield, key: "pois" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AddressChecker() {
  const tPage = useTranslations("pages.addressChecker");
  const tSearch = useTranslations("sections.addressChecker.search");
  const tBadges = useTranslations("sections.addressChecker.badges");
  const tRisk = useTranslations("sections.addressChecker.risk");

  const [state, setState] = useState<State>({ status: "idle" });
  const [highlightedLayer, setHighlightedLayer] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // ---- shared check logic ----
  const runCheck = useCallback(
    async (address: string) => {
      setState({ status: "loading" });

      try {
        const data = await checkAddress(address);
        setState({ status: "success", data });
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${tSearch("error")} (${err.status})`
            : tSearch("error");

        setState({ status: "error", message });
      }
    },
    [tSearch],
  );

  // ---- called when user picks from dropdown ----
  const handleSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      runCheck(suggestion.fullAddress);
    },
    [runCheck],
  );

  // ---- called when user clicks the button ----
  const handleSearch = useCallback(
    (query: string) => {
      runCheck(query);
    },
    [runCheck],
  );

  // ---- reset to start a new check ----
  const handleReset = useCallback(() => {
    setState({ status: "idle" });
    setHighlightedLayer(null);
    setSelectedLayer(null);
  }, []);

  // ---- scroll to map when a card is selected (mobile only) ----
  const handleInsightSelect = useCallback((layerId: string | null) => {
    setSelectedLayer(layerId);
    if (layerId) {
      // On mobile/tablet the map is stacked above → scroll to it.
      // On desktop (lg+) the map is sticky and already visible.
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;
      if (isMobile) {
        document.getElementById("gis-map-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, []);

  const aggregated =
    state.status === "success" ? state.data.aggregated : undefined;

  return (
    <main className="mx-auto max-w-1440 px-(--container-padding)">
      <AnimatePresence mode="wait">
        {/* ================================================================ */}
        {/* IDLE STATE — Hero Section                                        */}
        {/* ================================================================ */}
        {state.status === "idle" && (
          <motion.section
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="relative flex min-h-[calc(100vh-var(--header-h)-8rem)] flex-col items-center justify-center text-center"
          >
            {/* Decorative gradient orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="animate-orbPulse absolute -top-24 left-1/4 h-500 w-500 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] blur-[120px]" />
              <div className="animate-orbPulse absolute -bottom-16 right-1/4 h-400 w-400 rounded-full bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)] blur-[100px]" style={{ animationDelay: "6s" }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-4">
              {/* Eyebrow badge */}
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, duration: 0.5 }}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                  "bg-(--color-surface) text-xs font-semibold text-(--color-accent)",
                  "shadow-(--shadow-xs) border border-[color-mix(in_srgb,var(--color-accent)_20%,var(--color-border))]",
                )}
              >
                <MapPin size={14} />
                {tPage("hero.badge")}
              </motion.span>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.6 }}
                className="max-w-[20ch] text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-(--color-fg)"
              >
                {tPage("title")}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.6 }}
                className="max-w-[55ch] text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-(--color-fg-subtle)"
              >
                {tPage("description")}
              </motion.p>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {FEATURES.map(({ icon: Icon, key }) => (
                  <span
                    key={key}
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                      "bg-(--color-surface-muted) text-xs font-medium text-(--color-fg-subtle)",
                    )}
                  >
                    <Icon size={13} className="text-(--color-accent)" />
                    {tPage(`hero.features.${key}`)}
                  </span>
                ))}
              </motion.div>

              {/* Search bar */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mt-4 w-full max-w-640"
              >
                <AddressSearch
                  onSelect={handleSelect}
                  onSearch={handleSearch}
                  isLoading={false}
                  size="large"
                />
              </motion.div>
            </div>

            {/* ── Motivation CTA section ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative z-10 mx-auto mt-20 mb-12 max-w-3xl px-4"
            >
              <div
                className={clsx(
                  "rounded-(--radius) border p-8",
                  "border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]",
                  "bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)]",
                  "backdrop-blur-sm shadow-(--shadow-xs)",
                )}
              >
                <h2 className="mb-4 text-lg font-semibold text-(--color-fg)">
                  {tPage("cta.title")}
                </h2>
                <div className="space-y-3 text-sm leading-relaxed text-(--color-fg-subtle)">
                  <p>{tPage("cta.text1")}</p>
                  <p>{tPage("cta.text2")}</p>
                  <p className="font-medium text-(--color-fg)">
                    {tPage("cta.text3")}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* ================================================================ */}
        {/* LOADING STATE                                                    */}
        {/* ================================================================ */}
        {state.status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex min-h-[calc(100vh-var(--header-h)-8rem)] flex-col items-center justify-center"
          >
            <div className="flex items-center gap-3 text-(--color-muted)">
              <div
                className={clsx(
                  "h-5 w-5 rounded-full border-2 border-current border-t-transparent",
                  "animate-spin",
                )}
                aria-hidden="true"
              />
              <span>{tSearch("searching")}</span>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* ERROR STATE                                                      */}
        {/* ================================================================ */}
        {state.status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Section size="compact">
              <Card>
                <p className="text-(--color-warning)" role="alert">
                  {state.message}
                </p>
                <Button variant="secondary" onClick={handleReset}>
                  {tBadges("newCheck")}
                </Button>
              </Card>
            </Section>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* SUCCESS STATE — Two-Column Dashboard                             */}
        {/* ================================================================ */}
        {state.status === "success" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ---- 1. Sticky compact search bar ---- */}
            <div
              className={clsx(
                "sticky top-(--header-h) z-30 -mx-(--container-padding) px-(--container-padding)",
                "border-b border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]",
                "bg-[color-mix(in_srgb,var(--color-bg)_90%,transparent)] backdrop-blur-lg",
                "py-3",
              )}
            >
              <AddressSearch
                onSelect={handleSelect}
                onSearch={handleSearch}
                isLoading={false}
                size="compact"
              />
            </div>

            {/* ---- 2. Summary strip ---- */}
            <section className="py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Address */}
                {state.data.address && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <h2 className="text-[clamp(1.2rem,2.5vw,1.6rem)] font-bold text-(--color-fg)">
                      {state.data.address.fullAddress}
                    </h2>
                    <p className="text-sm text-(--color-fg-subtle)">
                      {state.data.address.postalCode} Wien,{" "}
                      {state.data.address.district}. Bezirk
                    </p>
                  </motion.div>
                )}

                {/* Risk banner (compact) */}
                {aggregated && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12 }}
                  >
                    <OverallRiskBanner
                      risk={aggregated.overallRisk}
                      color={aggregated.overallColor}
                      label={aggregated.overallLabel}
                      variant="compact"
                    />
                  </motion.div>
                )}

                {/* New Check button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button variant="secondary" size="sm" onClick={handleReset}>
                    {tBadges("newCheck")}
                  </Button>
                </motion.div>
              </div>
            </section>

            {/* ---- 3. Conflict warnings (full-width) ---- */}
            {aggregated && aggregated.conflicts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="pb-6"
              >
                <ConflictPanel conflicts={aggregated.conflicts} />
              </motion.section>
            )}

            {/* ---- 4. TWO-COLUMN DASHBOARD ---- */}
            {aggregated && (
              <section className="pb-12">
                <div
                  className={clsx(
                    "grid grid-cols-1 gap-6",
                    "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6",
                    "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:gap-8",
                  )}
                >
                  {/* ── LEFT COLUMN: Sticky Map ── */}
                  <motion.div
                    id="gis-map-section"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="lg:sticky lg:top-[calc(var(--header-h)+80px)] lg:self-start"
                  >
                    <div
                      className={clsx(
                        "overflow-hidden rounded-(--radius) shadow-(--shadow-sm)",
                        "border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]",
                        "h-[clamp(350px,50vh,450px)]",
                        "lg:h-[clamp(500px,60vh,700px)]",
                      )}
                    >
                      <GISMap
                        data={aggregated}
                        highlightedLayer={highlightedLayer}
                        selectedLayer={selectedLayer}
                        className="h-full w-full"
                      />
                    </div>
                  </motion.div>

                  {/* ── RIGHT COLUMN: Scrollable Cards ── */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col gap-6"
                  >
                    {/* Section title */}
                    <h2 className="text-[clamp(1.1rem,2vw,1.35rem)] font-semibold text-(--color-fg)">
                      {tRisk("title")}
                    </h2>

                    {/* Insight cards — stacked vertically */}
                    <motion.div
                      variants={cardStack}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-4"
                    >
                      {aggregated.layers.map((layer) => (
                        <motion.div key={layer.layerId} variants={cardItem}>
                          <InsightCard
                            layer={layer}
                            onHighlight={setHighlightedLayer}
                            onSelect={handleInsightSelect}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* POI list */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-2"
                    >
                      <POIList pois={state.data.pois} />
                    </motion.div>

                    {/* Disclaimer */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <div
                        className={clsx(
                          "rounded-sm border p-5",
                          "border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]",
                          "bg-[color-mix(in_srgb,var(--color-surface-muted)_70%,transparent)]",
                          "backdrop-blur-sm",
                        )}
                      >
                        <p className="text-xs text-(--color-muted)">
                          {tRisk("disclaimer.text")}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
