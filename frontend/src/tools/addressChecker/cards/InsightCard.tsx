"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

import type {
  LayerResult,
  SuitabilityRisk,
  TrafficLightColor,
  FactItem,
} from "@/types/viennagis";
import { getLayerColor } from "../map/layerStyles";

// ── Ampel colors (kept for expanded-section tinting) ────────────────────

const TRAFFIC_LIGHT_BG: Record<TrafficLightColor, string> = {
  green:
    "bg-[color-mix(in_srgb,var(--color-success)_8%,var(--color-surface))]",
  yellow:
    "bg-[color-mix(in_srgb,var(--color-warning)_8%,var(--color-surface))]",
  red: "bg-[color-mix(in_srgb,#d64545_8%,var(--color-surface))]",
  gray: "bg-[color-mix(in_srgb,var(--color-fg)_5%,var(--color-surface))]",
};

// ── Props ───────────────────────────────────────────────────────────────

interface InsightCardProps {
  layer: LayerResult;
  /** Called when mouse enters/leaves — for map highlight */
  onHighlight?: (layerId: string | null) => void;
  /** Called when user expands a card — triggers map fitBounds */
  onSelect?: (layerId: string | null) => void;
}

// ── Component ───────────────────────────────────────────────────────────

export default function InsightCard({
  layer,
  onHighlight,
  onSelect,
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!layer.available) return null;

  const layerColor = getLayerColor(layer.layerId);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    onSelect?.(next ? layer.layerId : null);
  };

  return (
    <div
      className={clsx(
        // Modern glassmorphic card
        "relative h-full overflow-hidden rounded-(--radius)",
        "border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]",
        "bg-[color-mix(in_srgb,var(--color-surface)_80%,transparent)]",
        "backdrop-blur-sm",
        "shadow-(--shadow-xs)",
        "[transition:transform_var(--transition-move),box-shadow_var(--transition-move),border-color_var(--transition-fade)]",
        "hover:shadow-(--shadow-sm) hover:-translate-y-0.5",
        "hover:border-[color-mix(in_srgb,var(--color-border)_90%,transparent)]",
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: layerColor.fill,
      }}
      onMouseEnter={() => onHighlight?.(layer.layerId)}
      onMouseLeave={() => onHighlight?.(null)}
    >
      {/* ── Header (always visible) ── */}
      <button
        type="button"
        onClick={handleToggle}
        className={clsx(
          "flex w-full items-center gap-3 p-4 text-left",
          "focus-visible:outline-[3px] focus-visible:outline-offset-[-3px]",
          "focus-visible:outline-[color-mix(in_srgb,var(--color-accent)_55%,transparent)]",
          "rounded-(--radius)",
        )}
        aria-expanded={expanded}
      >
        {/* Ampel dot */}
        <TrafficDot color={layer.color} risk={layer.risk} />

        {/* Label + short info */}
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-(--color-fg)">
            {layer.label}
          </span>
          {layer.facts.length > 0 && (
            <p className="mt-0.5 truncate text-xs text-(--color-fg-subtle)">
              {layer.facts[0].value}
            </p>
          )}
        </div>

        {/* Risk badge */}
        <RiskPill risk={layer.risk} />

        {/* Expand chevron */}
        <ChevronIcon expanded={expanded} />
      </button>

      {/* ── Expanded facts (animated) ── */}
      <AnimatePresence initial={false}>
        {expanded && layer.facts.length > 0 && (
          <motion.div
            key="facts"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className={clsx(
                "border-t border-[color-mix(in_srgb,var(--color-border)_30%,transparent)]",
                "px-4 py-3",
                TRAFFIC_LIGHT_BG[layer.color],
              )}
            >
              <dl className="grid gap-2.5">
                {layer.facts.map((fact) => (
                  <FactRow key={fact.label} fact={fact} />
                ))}
              </dl>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

/** Colored dot showing the traffic-light state */
function TrafficDot({
  color,
  risk,
}: {
  color: TrafficLightColor;
  risk: SuitabilityRisk;
}) {
  const dotColors: Record<TrafficLightColor, string> = {
    green: "bg-[var(--color-success)]",
    yellow: "bg-[var(--color-warning)]",
    red: "bg-[#d64545]",
    gray: "bg-[var(--color-muted)]",
  };

  return (
    <span
      className={clsx(
        "h-3 w-3 shrink-0 rounded-full",
        dotColors[color],
      )}
      aria-label={`Risiko: ${risk}`}
    />
  );
}

/** Small pill showing the risk level */
function RiskPill({ risk }: { risk: SuitabilityRisk }) {
  const styles: Record<SuitabilityRisk, string> = {
    low: "bg-[color-mix(in_srgb,var(--color-success)_18%,var(--color-surface))] text-[var(--color-success)]",
    medium:
      "bg-[color-mix(in_srgb,var(--color-warning)_18%,var(--color-surface))] text-[var(--color-warning)]",
    high: "bg-[color-mix(in_srgb,#d64545_18%,var(--color-surface))] text-[#d64545]",
  };

  const labels: Record<SuitabilityRisk, string> = {
    low: "Gering",
    medium: "Mittel",
    high: "Hoch",
  };

  return (
    <span
      className={clsx(
        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[risk],
      )}
    >
      {labels[risk]}
    </span>
  );
}

/** URL detection regex */
const URL_REGEX = /^https?:\/\//i;

/** Single fact row inside the expanded section – renders URLs as clickable links */
function FactRow({ fact }: { fact: FactItem }) {
  const isUrl = URL_REGEX.test(fact.value);

  return (
    <div className="flex items-baseline gap-2 text-sm">
      <dt className="shrink-0 font-medium text-(--color-fg-subtle)">
        {fact.label}:
      </dt>
      <dd className="min-w-0 break-words text-(--color-fg)">
        {isUrl ? (
          <a
            href={fact.value}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "text-(--color-accent) underline decoration-1 underline-offset-2",
              "hover:text-(--color-accent-strong) hover:decoration-2",
              "transition-colors duration-150",
            )}
          >
            {fact.label === "Link" ? "Dokument öffnen ↗" : `${fact.label} öffnen ↗`}
          </a>
        ) : (
          fact.value
        )}
        {fact.note && (
          <span className="ml-1.5 text-xs text-(--color-muted)">
            ({fact.note})
          </span>
        )}
      </dd>
    </div>
  );
}

/** Animated chevron icon */
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={clsx(
        "h-4 w-4 shrink-0 text-(--color-muted) transition-transform duration-200",
        expanded && "rotate-180",
      )}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
