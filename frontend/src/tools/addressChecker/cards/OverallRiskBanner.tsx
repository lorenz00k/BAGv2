"use client";

import clsx from "clsx";

import type {
  SuitabilityRisk,
  TrafficLightColor,
} from "@/types/viennagis";

// ── Props ───────────────────────────────────────────────────────────────

interface OverallRiskBannerProps {
  risk: SuitabilityRisk;
  color: TrafficLightColor;
  label: string;
  /** "default" = full-width banner, "compact" = inline pill */
  variant?: "default" | "compact";
}

// ── Styles ──────────────────────────────────────────────────────────────

const BANNER_STYLES: Record<
  TrafficLightColor,
  { bg: string; border: string; icon: string; text: string }
> = {
  green: {
    bg: "bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))]",
    border:
      "border-[color-mix(in_srgb,var(--color-success)_30%,var(--color-border))]",
    icon: "text-[var(--color-success)]",
    text: "text-[var(--color-success)]",
  },
  yellow: {
    bg: "bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-surface))]",
    border:
      "border-[color-mix(in_srgb,var(--color-warning)_30%,var(--color-border))]",
    icon: "text-[var(--color-warning)]",
    text: "text-[var(--color-warning)]",
  },
  red: {
    bg: "bg-[color-mix(in_srgb,#d64545_10%,var(--color-surface))]",
    border: "border-[color-mix(in_srgb,#d64545_30%,var(--color-border))]",
    icon: "text-[#d64545]",
    text: "text-[#d64545]",
  },
  gray: {
    bg: "bg-[color-mix(in_srgb,var(--color-fg)_6%,var(--color-surface))]",
    border:
      "border-[color-mix(in_srgb,var(--color-fg)_15%,var(--color-border))]",
    icon: "text-(--color-muted)",
    text: "text-(--color-fg-subtle)",
  },
};

const RISK_LABELS: Record<SuitabilityRisk, string> = {
  low: "Geringes Risiko",
  medium: "Mittleres Risiko",
  high: "Hohes Risiko",
};

// ── Component ───────────────────────────────────────────────────────────

export default function OverallRiskBanner({
  risk,
  color,
  label,
  variant = "default",
}: OverallRiskBannerProps) {
  const s = BANNER_STYLES[color];

  if (variant === "compact") {
    return (
      <div
        className={clsx(
          "inline-flex items-center gap-2.5 rounded-full border px-4 py-2",
          s.bg,
          s.border,
        )}
      >
        <div
          className={clsx(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            "bg-[color-mix(in_srgb,currentColor_12%,transparent)]",
            s.icon,
          )}
        >
          <RiskIcon risk={risk} />
        </div>
        <div className="min-w-0">
          <p className={clsx("text-sm font-bold leading-tight", s.text)}>
            {RISK_LABELS[risk]}
          </p>
          <p className="text-xs leading-tight text-(--color-fg-subtle)">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center gap-4 rounded-(--radius) border p-4",
        s.bg,
        s.border,
      )}
    >
      {/* Traffic-light icon */}
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          "bg-[color-mix(in_srgb,currentColor_12%,transparent)]",
          s.icon,
        )}
      >
        <RiskIcon risk={risk} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={clsx("text-sm font-bold", s.text)}>
          {RISK_LABELS[risk]}
        </p>
        <p className="mt-0.5 text-sm text-(--color-fg-subtle)">{label}</p>
      </div>
    </div>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

function RiskIcon({ risk }: { risk: SuitabilityRisk }) {
  // Checkmark for low, warning triangle for medium, X-circle for high
  switch (risk) {
    case "low":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "medium":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "high":
      return (
        <svg
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}
