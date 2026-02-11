"use client";

import clsx from "clsx";

import type { ConflictWarning } from "@/types/viennagis";
import { LAYER_LABELS } from "../map/layerStyles";

// ── Severity config ─────────────────────────────────────────────────────

type SeverityConfig = {
  bg: string;
  border: string;
  icon: string;
  label: string;
};

const SEVERITY: Record<ConflictWarning["severity"], SeverityConfig> = {
  critical: {
    bg: "bg-[color-mix(in_srgb,#d64545_10%,var(--color-surface))]",
    border: "border-[color-mix(in_srgb,#d64545_35%,var(--color-border))]",
    icon: "text-[#d64545]",
    label: "Kritisch",
  },
  warning: {
    bg: "bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-surface))]",
    border:
      "border-[color-mix(in_srgb,var(--color-warning)_35%,var(--color-border))]",
    icon: "text-[var(--color-warning)]",
    label: "Achtung",
  },
  info: {
    bg: "bg-[color-mix(in_srgb,var(--color-accent)_8%,var(--color-surface))]",
    border:
      "border-[color-mix(in_srgb,var(--color-accent)_25%,var(--color-border))]",
    icon: "text-[var(--color-accent)]",
    label: "Hinweis",
  },
};

const SEVERITY_ORDER: ConflictWarning["severity"][] = [
  "critical",
  "warning",
  "info",
];

// ── Props ───────────────────────────────────────────────────────────────

interface ConflictPanelProps {
  conflicts: ConflictWarning[];
}

// ── Component ───────────────────────────────────────────────────────────

export default function ConflictPanel({ conflicts }: ConflictPanelProps) {
  if (conflicts.length === 0) return null;

  const sorted = [...conflicts].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((conflict, i) => {
        const s = SEVERITY[conflict.severity];
        return (
          <div
            key={`${conflict.layers[0]}-${conflict.layers[1]}-${i}`}
            className={clsx(
              "flex items-start gap-3 rounded-[var(--radius-sm)] border p-3",
              s.bg,
              s.border,
            )}
          >
            <span className={clsx("mt-0.5 shrink-0", s.icon)}>
              <SeverityIcon severity={conflict.severity} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-(--color-fg)">{conflict.description}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {conflict.layers.map((layerId) => (
                  <span
                    key={layerId}
                    className="rounded-full bg-[color-mix(in_srgb,var(--color-fg)_8%,var(--color-surface))] px-2 py-0.5 text-[0.7rem] font-medium text-(--color-fg-subtle)"
                  >
                    {LAYER_LABELS[layerId] ?? layerId}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

function SeverityIcon({
  severity,
}: {
  severity: ConflictWarning["severity"];
}) {
  const cls = "h-4 w-4";

  switch (severity) {
    case "critical":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      );
    case "warning":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
    case "info":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
      );
  }
}
