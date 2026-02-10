"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import dynamic from "next/dynamic";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardBody } from "@/components/ui/Card";
import { checkAddress, ApiError } from "@/services/api";
import type { AddressSuggestion, ViennaGISResult } from "@/types/viennagis";

import AddressSearch from "./AddressSearch";
import InsightCard from "./cards/InsightCard";
import OverallRiskBanner from "./cards/OverallRiskBanner";

// Lazy-load the map (it imports maplibre-gl which is a large client-only lib)
const GISMap = dynamic(() => import("./map/GISMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg bg-[var(--color-surface)] text-(--color-muted)">
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
// Component
// ---------------------------------------------------------------------------

export default function AddressChecker() {
  const tPage = useTranslations("pages.addressChecker");
  const tSearch = useTranslations("sections.addressChecker.search");
  const tBadges = useTranslations("sections.addressChecker.badges");
  const tPois = useTranslations("sections.addressChecker.pois");
  const tRisk = useTranslations("sections.addressChecker.risk");

  const [state, setState] = useState<State>({ status: "idle" });
  const [highlightedLayer, setHighlightedLayer] = useState<string | null>(null);

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
  }, []);

  const aggregated =
    state.status === "success" ? state.data.aggregated : undefined;

  return (
    <main className="mx-auto max-w-[1440px] px-(--container-padding)">
      {/* ---- Header ---- */}
      <Section size="compact">
        <h1 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold tracking-tight text-(--color-fg)">
          {tPage("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-(--color-fg-subtle)">
          {tPage("description")}
        </p>
      </Section>

      {/* ---- Search ---- */}
      <Section size="compact">
        <AddressSearch
          onSelect={handleSelect}
          onSearch={handleSearch}
          isLoading={state.status === "loading"}
        />
      </Section>

      {/* ---- Loading ---- */}
      {state.status === "loading" && (
        <Section size="compact">
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
        </Section>
      )}

      {/* ---- Error ---- */}
      {state.status === "error" && (
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
      )}

      {/* ---- Results: Dashboard Layout ---- */}
      {state.status === "success" && (
        <section className="py-[clamp(1rem,3vw,2rem)]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(340px,420px)_1fr]">
            {/* ── Left panel: Data ── */}
            <div className="flex flex-col gap-4 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-2">
              {/* Address confirmation */}
              {state.data.address && (
                <Card>
                  <CardTitle>{state.data.address.fullAddress}</CardTitle>
                  <CardBody>
                    {state.data.address.postalCode} Wien,{" "}
                    {state.data.address.district}. Bezirk
                  </CardBody>
                </Card>
              )}

              {/* Overall risk banner */}
              {aggregated && (
                <OverallRiskBanner
                  risk={aggregated.overallRisk}
                  color={aggregated.overallColor}
                  label={aggregated.overallLabel}
                />
              )}

              {/* Layer insight cards */}
              {aggregated && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-[clamp(1.1rem,2vw,1.35rem)] font-semibold text-(--color-fg)">
                    {tRisk("title")}
                  </h2>
                  {aggregated.layers.map((layer) => (
                    <InsightCard
                      key={layer.layerId}
                      layer={layer}
                      onHighlight={setHighlightedLayer}
                    />
                  ))}
                </div>
              )}

              {/* Nearby POIs */}
              {state.data.pois.length > 0 && (
                <div>
                  <h2 className="mb-2 text-[clamp(1.1rem,2vw,1.35rem)] font-semibold text-(--color-fg)">
                    {tPois("title")}
                  </h2>
                  <div className="grid gap-2">
                    {state.data.pois.map((poi) => (
                      <Card
                        key={`${poi.name}-${poi.distance}`}
                        variant="subtle"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-(--color-fg)">
                              {poi.name}
                            </span>
                            <span className="ml-2 text-sm text-(--color-muted)">
                              {tPois(`categories.${poi.type}`)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-(--color-accent)">
                            {poi.distance}m
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {state.data.pois.length === 0 && (
                <div>
                  <h2 className="mb-2 text-[clamp(1.1rem,2vw,1.35rem)] font-semibold text-(--color-fg)">
                    {tPois("title")}
                  </h2>
                  <p className="text-(--color-muted)">{tPois("empty")}</p>
                </div>
              )}

              {/* Disclaimer + Actions */}
              <p className="text-xs text-(--color-muted)">
                {tRisk("disclaimer.text")}
              </p>
              <div className="flex flex-wrap gap-3 pb-4">
                <Button variant="secondary" onClick={handleReset}>
                  {tBadges("newCheck")}
                </Button>
              </div>
            </div>

            {/* ── Right panel: Map ── */}
            <div className="sticky top-4 h-[calc(100vh-12rem)] min-h-[400px] rounded-lg border border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] shadow-[var(--shadow-xs)]">
              <GISMap
                data={aggregated}
                highlightedLayer={highlightedLayer}
                className="h-full w-full rounded-lg"
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
