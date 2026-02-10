import type { TrafficLightColor } from "@/types/viennagis";

/** Color palette per traffic-light risk color */
export const RISK_COLORS: Record<
  TrafficLightColor,
  { fill: string; stroke: string; fillOpacity: number }
> = {
  green: { fill: "#22c55e", stroke: "#16a34a", fillOpacity: 0.18 },
  yellow: { fill: "#eab308", stroke: "#ca8a04", fillOpacity: 0.22 },
  red: { fill: "#ef4444", stroke: "#dc2626", fillOpacity: 0.22 },
  gray: { fill: "#9ca3af", stroke: "#6b7280", fillOpacity: 0.12 },
};

/** Highlighted (hovered / selected) state */
export const HIGHLIGHT_COLORS: Record<
  TrafficLightColor,
  { fill: string; stroke: string; fillOpacity: number }
> = {
  green: { fill: "#22c55e", stroke: "#15803d", fillOpacity: 0.35 },
  yellow: { fill: "#eab308", stroke: "#a16207", fillOpacity: 0.38 },
  red: { fill: "#ef4444", stroke: "#b91c1c", fillOpacity: 0.38 },
  gray: { fill: "#9ca3af", stroke: "#4b5563", fillOpacity: 0.25 },
};

/** Human-readable labels for each layer */
export const LAYER_LABELS: Record<string, string> = {
  zoning: "Flächenwidmung",
  realnutzung: "Realnutzung",
  noise: "Lärm",
  floodRisk: "Hochwasser",
  energyPlan: "Energieraumplan",
  planDocument: "Plandokument",
};
