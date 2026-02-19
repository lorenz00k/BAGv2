/**
 * Checks whether a facility has any exclusion grounds that would
 * prevent it from qualifying for a GFVO exemption.
 *
 * Each check is a pure predicate — no side effects, no DB access.
 */

import type { ComplianceInput } from "../../types/compliance.js";

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface ExclusionResult {
  /** True when at least one exclusion ground applies */
  readonly excluded: boolean;
  /** i18n reason keys explaining which exclusions were triggered */
  readonly reasonKeys: readonly string[];
}

// ---------------------------------------------------------------------------
// Core exclusion checks (§ 2 der 2. GFVO)
// ---------------------------------------------------------------------------

/**
 * Check GFVO exclusion grounds:
 * - External ventilation / cooling units (§ 2 Z 2)
 * - Regulated hazardous storage (§ 2 Z 3)
 * - Labelled hazardous storage (§ 2 Z 4)
 * - Loud music / amplification (§ 2 Z 5)
 * - IPPC / Seveso relevance (§ 2 Z 6)
 */
export function checkExclusions(input: ComplianceInput): ExclusionResult {
  const reasonKeys: string[] = [];

  if (input.hasExternalVentilation === "yes") {
    reasonKeys.push("complianceResult.reasons.externalVentilation");
  }

  if (input.storesRegulatedHazardous === "yes") {
    reasonKeys.push("complianceResult.reasons.regulatedHazardousStorage");
  }

  if (input.storesLabelledHazardous === "yes") {
    reasonKeys.push("complianceResult.reasons.labelledHazardousStorage");
  }

  if (input.usesLoudMusic === "yes") {
    reasonKeys.push("complianceResult.reasons.musicExclusion");
  }

  if (input.ippcOrSevesoRelevant === "yes") {
    reasonKeys.push("complianceResult.reasons.ippcSeveso");
  }

  return { excluded: reasonKeys.length > 0, reasonKeys };
}

// ---------------------------------------------------------------------------
// Accommodation-specific reason checks
// ---------------------------------------------------------------------------

/**
 * Additional reason keys for accommodation / hospitality subtypes.
 * These explain *why* a facility that might otherwise qualify for
 * the accommodation exemption does not meet the requirements.
 */
export function checkAccommodationReasons(
  input: ComplianceInput,
  gfvoCategoryKey: string | undefined
): readonly string[] {
  if (gfvoCategoryKey !== "accommodation") {
    return [];
  }

  const reasons: string[] = [];

  if ((input.bedCount ?? 0) > 30) {
    reasons.push("complianceResult.reasons.accommodationBeds");
  }

  if (input.buildingUseExclusive !== "yes") {
    reasons.push("complianceResult.reasons.accommodationBuildingUse");
  }

  if (input.hasWellnessFacilities === "yes") {
    reasons.push("complianceResult.reasons.accommodationWellness");
  }

  if (input.servesFullMeals === "yes") {
    reasons.push("complianceResult.reasons.accommodationMeals");
  }

  return reasons;
}
