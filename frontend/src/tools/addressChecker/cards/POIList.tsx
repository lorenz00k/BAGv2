"use client";

import clsx from "clsx";

import type { POI } from "@/types/viennagis";

// ── POI type icons ──────────────────────────────────────────────────────

const POI_META: Record<POI["type"], { label: string; icon: JSX.Element }> = {
  krankenhaus: {
    label: "Krankenhaus",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0V9H5a1 1 0 110-2h4V3a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  religion: {
    label: "Kirche / Moschee",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 2a.75.75 0 01.75.75V5h2.5a.75.75 0 010 1.5h-2.5v2.75h2.5a.75.75 0 010 1.5h-2.5V17a.75.75 0 01-1.5 0v-6.25h-2.5a.75.75 0 010-1.5h2.5V6.5h-2.5a.75.75 0 010-1.5h2.5V2.75A.75.75 0 0110 2z" />
      </svg>
    ),
  },
  schule: {
    label: "Schule",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.75 16.82A7.462 7.462 0 0115 15.5a7.5 7.5 0 002.046-.282.75.75 0 00.454-.89A8.997 8.997 0 0010 8.5a8.997 8.997 0 00-7.5 5.828.75.75 0 00.454.89A7.5 7.5 0 005 15.5c1.578 0 3.04-.487 4.25-1.32V16a.75.75 0 001.5 0v-.68zM10 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      </svg>
    ),
  },
  kindergarten: {
    label: "Kindergarten",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
      </svg>
    ),
  },
  friedhof: {
    label: "Friedhof",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v1H3a1 1 0 000 2h1v10a1 1 0 001 1h10a1 1 0 001-1V7h1a1 1 0 100-2h-1V4a2 2 0 00-2-2H6zm0 2h8v1H6V4zm0 3h8v9H6V7z" clipRule="evenodd" />
      </svg>
    ),
  },
};

// ── Props ───────────────────────────────────────────────────────────────

interface POIListProps {
  pois: POI[];
}

// ── Component ───────────────────────────────────────────────────────────

export default function POIList({ pois }: POIListProps) {
  return (
    <div>
      <h2 className="mb-2 text-[clamp(1.1rem,2vw,1.35rem)] font-semibold text-(--color-fg)">
        Schutzobjekte in der Nähe
      </h2>

      {pois.length === 0 ? (
        <p className="text-sm text-(--color-muted)">
          Keine Schutzobjekte im Umkreis gefunden.
        </p>
      ) : (
        <div className="grid gap-1.5">
          {pois.map((poi) => {
            const meta = POI_META[poi.type];
            return (
              <div
                key={`${poi.name}-${poi.distance}`}
                className={clsx(
                  "flex items-center gap-3 rounded-[var(--radius-sm)] border px-3 py-2.5",
                  "border-[color-mix(in_srgb,var(--color-border)_60%,transparent)]",
                  "bg-[var(--color-surface)]",
                )}
              >
                <span className="shrink-0 text-(--color-accent)">
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-(--color-fg)">
                    {poi.name}
                  </span>
                  <span className="ml-1.5 text-xs text-(--color-muted)">
                    {meta.label}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] px-2 py-0.5 text-xs font-semibold text-(--color-accent)">
                  {poi.distance}m
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
