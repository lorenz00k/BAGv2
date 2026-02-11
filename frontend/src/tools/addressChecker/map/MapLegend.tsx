"use client";

import type { LayerResult } from "@/types/viennagis";
import { RISK_COLORS } from "./layerStyles";

// ── Props ───────────────────────────────────────────────────────────────

interface MapLegendProps {
  layers: LayerResult[];
}

// ── Component ───────────────────────────────────────────────────────────

export default function MapLegend({ layers }: MapLegendProps) {
  const visibleLayers = layers.filter((l) => l.available && l.geometry);

  return (
    <div className="absolute bottom-3 left-3 z-10 rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-border)_60%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-3 py-2 shadow-[var(--shadow-xs)] backdrop-blur-sm">
      <ul className="flex flex-col gap-1.5">
        {visibleLayers.map((layer) => (
          <li key={layer.layerId} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: RISK_COLORS[layer.color].fill }}
            />
            <span className="text-xs text-(--color-fg)">{layer.label}</span>
          </li>
        ))}

        {/* Static entries */}
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full bg-[#6366f1]" />
          <span className="text-xs text-(--color-fg)">Schutzobjekte</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full bg-[#1e40af]" />
          <span className="text-xs text-(--color-fg)">Standort</span>
        </li>
      </ul>
    </div>
  );
}
