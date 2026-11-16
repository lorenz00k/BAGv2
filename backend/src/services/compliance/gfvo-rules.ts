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
  readonly operatingWindow: OperatingWindowRegime;
}
/**
 * Which operating-time regime applies (§ 1 Abs. 2 der 2. GFVO):
 * - "gfvo":          standard window (Mo–Fr 6–22, Sa 6–19)
 * - "none":          no operating-time restriction (Abs. 2 Schlussteil, Z 8–12)
 * - "generalPermit": times come from the Generalgenehmigungsbescheid (Z 13);
 *                    the GFVO window does not apply and we cannot judge the times
 */
type OperatingWindowRegime = "gfvo" | "none" | "generalPermit";

// ---------------------------------------------------------------------------
// Exempt categories (§ 1 Abs. 1 Z 1–13 der 2. GFVO)
// ---------------------------------------------------------------------------

const GFVO_EXEMPT_CATEGORIES: readonly GfvoRule[] = [
  {
    key: "retail",
    matches: (input) =>
      input.sector === "retail" && (input.areaSqm ?? Infinity) <= 600,
    operatingWindow: "gfvo",
  },
  {
    key: "office",
    matches: (input) => input.sector === "office",
    operatingWindow: "gfvo",
  },
  {
    key: "warehouse",
    matches: (input) =>
      input.sector === "warehouse" && (input.areaSqm ?? Infinity) <= 600,
    operatingWindow: "gfvo",
  },
  {
    key: "cosmetics",
    matches: (input) => input.sector === "cosmetics",
    operatingWindow: "gfvo",
  },
  {
    key: "tailor",
    matches: (input) =>
      input.sector === "workshop" &&
      (input.workshopSubtype === "tailor" ||
        input.workshopSubtype === "shoeService"),
    operatingWindow: "gfvo",
  },
  {
    key: "textilePickup",
    matches: (input) =>
      input.sector === "workshop" && input.workshopSubtype === "textilePickup",
    operatingWindow: "none",
  },
  {
    key: "accommodation",
    matches: (input) =>
      (input.sector === "accommodation" ||
        (input.sector === "gastronomyHotel" &&
          input.hospitalitySubtype === "beherbergung")) &&
      (input.bedCount ?? Infinity) <= 30 &&
      input.hasOtherResidents === "no" &&
      input.hasWellnessFacilities !== "yes" &&
      input.servesFullMeals !== "yes",

    operatingWindow: "none",
  },
  {
    key: "iceSalon",
    matches: (input) =>
      input.sector === "gastronomyHotel" &&
      input.hospitalitySubtype === "iceSalon",
    operatingWindow: "none",
  },
  {
    key: "dataCenter",
    matches: (input) =>
      input.sector === "dataCenter" &&
      input.hasNonEmergencyCombustion !== "yes",
    operatingWindow: "none",
  },
  {
    key: "infrastructureSite",
    matches: (input) => input.locatedInInfrastructureSite === "yes",
    operatingWindow: "none",
  },
  {
    key: "embeddedFacility",
    matches: (input) =>
      input.locatedInApprovedComplex === "yes" &&
      (input.areaSqm ?? Infinity) <= 400,
    operatingWindow: "generalPermit",
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

export function getOperatingWindowRegime(
  gfvoKey: string | undefined
): OperatingWindowRegime {
  const rule = GFVO_EXEMPT_CATEGORIES.find((r) => r.key === gfvoKey);
  return rule?.operatingWindow ?? "gfvo";
}

export function isOperatingWindowCompliant(
  input: ComplianceInput,
  gfvoKey: string | undefined
): boolean {
  if (getOperatingWindowRegime(gfvoKey) !== "gfvo") {
    return true;
  }

  return (
    input.operatingPattern === "gfvoWindow" ||
    input.operatingPattern === undefined
  );
}
