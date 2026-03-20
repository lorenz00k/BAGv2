/**
 * GFVO (2. Genehmigungsfreistellungsverordnung) rule engine.
 *
 * Determines whether a facility matches one of the exempt categories
 * and whether operating hours fall within the GFVO time window.
 *
 * Each rule is a pure predicate — no side effects, no DB access.
 */

import type { ComplianceInput } from "../../types/compliance.js";

// ---------------------------------------------------------------------------
// Rule definition
// ---------------------------------------------------------------------------

interface GfvoRule {
  /** Unique key matching the i18n GFVO category key */
  readonly key: string;
  /** Returns true when the input matches this exempt category */
  readonly matches: (input: ComplianceInput) => boolean;
  /** If true, this category has no operating-window restriction */
  readonly exemptFromOperatingWindow: boolean;
}

// ---------------------------------------------------------------------------
// Exempt categories (§ 1 Abs. 1 Z 1–13 der 2. GFVO)
// ---------------------------------------------------------------------------

const GFVO_EXEMPT_CATEGORIES: readonly GfvoRule[] = [
  {
    key: "retail",
    matches: (input) =>
      input.sector === "retail" && (input.areaSqm ?? Infinity) <= 600,
    exemptFromOperatingWindow: false,
  },
  {
    key: "office",
    matches: (input) => input.sector === "office",
    exemptFromOperatingWindow: false,
  },
  {
    key: "warehouse",
    matches: (input) =>
      input.sector === "warehouse" && (input.areaSqm ?? Infinity) <= 600,
    exemptFromOperatingWindow: false,
  },
  {
    key: "cosmetics",
    matches: (input) => input.sector === "cosmetics",
    exemptFromOperatingWindow: false,
  },
  {
    key: "tailor",
    matches: (input) =>
      input.sector === "workshop" &&
      (input.workshopSubtype === "tailor" ||
        input.workshopSubtype === "shoeService"),
    exemptFromOperatingWindow: false,
  },
  {
    key: "textilePickup",
    matches: (input) =>
      input.sector === "workshop" &&
      input.workshopSubtype === "textilePickup",
    exemptFromOperatingWindow: true,
  },
  {
    key: "accommodation",
    matches: (input) =>
      (input.sector === "accommodation" ||
        (input.sector === "gastronomyHotel" &&
          input.hospitalitySubtype === "beherbergung")) &&
      (input.bedCount ?? Infinity) <= 30 &&
      input.buildingUseExclusive === "yes" &&
      input.hasWellnessFacilities !== "yes" &&
      input.servesFullMeals !== "yes",
    exemptFromOperatingWindow: true,
  },
  {
    key: "iceSalon",
    matches: (input) =>
      input.sector === "gastronomyHotel" &&
      input.hospitalitySubtype === "iceSalon",
    exemptFromOperatingWindow: true,
  },
  {
    key: "dataCenter",
    matches: (input) => input.sector === "dataCenter",
    exemptFromOperatingWindow: true,
  },
  {
    key: "infrastructureSite",
    matches: (input) => input.locatedInInfrastructureSite === "yes",
    exemptFromOperatingWindow: true,
  },
  {
    key: "embeddedFacility",
    matches: (input) =>
      input.locatedInApprovedComplex === "yes" &&
      (input.areaSqm ?? Infinity) <= 400,
    exemptFromOperatingWindow: true,
  },
] as const;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find the first matching GFVO exempt category for the given input.
 * Returns the category key (e.g. "retail", "accommodation") or undefined.
 */
export function determineGfvoCategory(
  input: ComplianceInput
): string | undefined {
  const match = GFVO_EXEMPT_CATEGORIES.find((rule) => rule.matches(input));
  return match?.key;
}

/**
 * Check whether the planned operating hours are compatible with the
 * GFVO exemption. Categories flagged as `exemptFromOperatingWindow`
 * are never restricted by operating hours.
 *
 * Returns `true` when operating hours do NOT block exemption.
 */
export function isOperatingWindowCompliant(
  input: ComplianceInput,
  gfvoKey: string | undefined
): boolean {
  // If we matched a rule that has no window restriction → always compliant
  if (gfvoKey) {
    const rule = GFVO_EXEMPT_CATEGORIES.find((r) => r.key === gfvoKey);
    if (rule?.exemptFromOperatingWindow) {
      return true;
    }
  }

  // For all other cases, only the standard GFVO window is permitted
  return input.operatingPattern === "gfvoWindow" ||
    input.operatingPattern === undefined;
}
