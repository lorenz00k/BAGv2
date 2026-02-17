import type { SuitabilityRisk, TrafficLightColor } from "@/types/viennagis";

// ── Layer-specific colors (unique per layer, independent of risk) ───────

type LayerColorEntry = { fill: string; stroke: string; fillOpacity: number };

/**
 * Unique color per layer — maximally distinct hues spread across the spectrum.
 *
 *   zoning       → Blue        (230°)
 *   realnutzung  → Orange      ( 25°)
 *   noise        → Rose/Pink   (330°)
 *   floodRisk    → Cyan        (190°)
 *   energyPlan   → Green       (145°)
 *   planDocument → Slate/Gray  (215°)
 */
export const LAYER_COLORS: Record<string, LayerColorEntry> = {
  zoning:       { fill: "#3b82f6", stroke: "#2563eb", fillOpacity: 0.22 },  // Blue
  realnutzung:  { fill: "#f97316", stroke: "#ea580c", fillOpacity: 0.24 },  // Orange
  noise:        { fill: "#ec4899", stroke: "#db2777", fillOpacity: 0.22 },  // Pink
  floodRisk:    { fill: "#06b6d4", stroke: "#0891b2", fillOpacity: 0.24 },  // Cyan
  energyPlan:   { fill: "#22c55e", stroke: "#16a34a", fillOpacity: 0.22 },  // Green
  planDocument: { fill: "#64748b", stroke: "#475569", fillOpacity: 0.18 },  // Slate
};

/** Highlighted (hovered / selected) version of layer colors. */
export const LAYER_COLORS_HIGHLIGHT: Record<string, LayerColorEntry> = {
  zoning:       { fill: "#3b82f6", stroke: "#1d4ed8", fillOpacity: 0.40 },
  realnutzung:  { fill: "#f97316", stroke: "#c2410c", fillOpacity: 0.42 },
  noise:        { fill: "#ec4899", stroke: "#be185d", fillOpacity: 0.40 },
  floodRisk:    { fill: "#06b6d4", stroke: "#0e7490", fillOpacity: 0.42 },
  energyPlan:   { fill: "#22c55e", stroke: "#15803d", fillOpacity: 0.40 },
  planDocument: { fill: "#64748b", stroke: "#334155", fillOpacity: 0.30 },
};

/** Fallback layer color for unknown layer IDs. */
const FALLBACK_LAYER: LayerColorEntry = { fill: "#64748b", stroke: "#475569", fillOpacity: 0.14 };

export function getLayerColor(layerId: string): LayerColorEntry {
  return LAYER_COLORS[layerId] ?? FALLBACK_LAYER;
}

export function getLayerHighlightColor(layerId: string): LayerColorEntry {
  return LAYER_COLORS_HIGHLIGHT[layerId] ?? FALLBACK_LAYER;
}

// ── Risk-based stroke patterns (communicates risk via line style) ────────

export const RISK_STROKE_PATTERNS: Record<
  SuitabilityRisk,
  { width: number; dashArray?: number[] }
> = {
  low:    { width: 2 },
  medium: { width: 2.5, dashArray: [5, 3] },
  high:   { width: 3,   dashArray: [5, 3] },
};

// ── Risk-based colors (kept for InsightCard backgrounds & banners) ──────

/** Color palette per traffic-light risk color */
export const RISK_COLORS: Record<
  TrafficLightColor,
  { fill: string; stroke: string; fillOpacity: number }
> = {
  green:  { fill: "#22c55e", stroke: "#16a34a", fillOpacity: 0.18 },
  yellow: { fill: "#eab308", stroke: "#ca8a04", fillOpacity: 0.22 },
  red:    { fill: "#ef4444", stroke: "#dc2626", fillOpacity: 0.22 },
  gray:   { fill: "#9ca3af", stroke: "#6b7280", fillOpacity: 0.12 },
};

/** Highlighted (hovered / selected) state for risk colors */
export const HIGHLIGHT_COLORS: Record<
  TrafficLightColor,
  { fill: string; stroke: string; fillOpacity: number }
> = {
  green:  { fill: "#22c55e", stroke: "#15803d", fillOpacity: 0.35 },
  yellow: { fill: "#eab308", stroke: "#a16207", fillOpacity: 0.38 },
  red:    { fill: "#ef4444", stroke: "#b91c1c", fillOpacity: 0.38 },
  gray:   { fill: "#9ca3af", stroke: "#4b5563", fillOpacity: 0.25 },
};

// ── Human-readable labels ───────────────────────────────────────────────

/** Human-readable labels for each layer */
export const LAYER_LABELS: Record<string, string> = {
  zoning: "Flächenwidmung",
  realnutzung: "Realnutzung",
  noise: "Lärm",
  floodRisk: "Hochwasser",
  energyPlan: "Energieraumplan",
  planDocument: "Plandokument",
};
