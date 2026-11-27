import type { ComplianceInput } from "../../types/compliance.js";
import type { ReasonKey } from "../checker/evaluate.js";
import { LIMITS } from "./gfvo-rules.js";

export interface ExclusionResult {
  readonly excluded: boolean;
  readonly reasonKeys: readonly ReasonKey[];
}

/** § 2 der 2. GFVO: Ausschließungsgründe */
export function checkExclusions(input: ComplianceInput): ExclusionResult {
  const reasonKeys: ReasonKey[] = [];

  if (input.hasExternalVentilation === "yes") reasonKeys.push("externalVentilation");
  if (input.storesRegulatedHazardous === "yes") reasonKeys.push("regulatedHazardousStorage");
  if (input.storesLabelledHazardous === "yes") reasonKeys.push("labelledHazardousStorage");
  if (input.usesLoudMusic === "yes") reasonKeys.push("musicExclusion");
  if (input.ippcOrSevesoRelevant === "yes") reasonKeys.push("ippcSeveso");

  return { excluded: reasonKeys.length > 0, reasonKeys };
}

function isAccommodation(input: ComplianceInput): boolean {
  return (
    input.sector === "accommodation" ||
    (input.sector === "gastronomyHotel" &&
      input.hospitalitySubtype === "beherbergung")
  );
}

function checkAreaLimit(input: ComplianceInput): ReasonKey[] {
  const isLimited = input.sector === "retail" || input.sector === "warehouse";
  return isLimited && (input.areaSqm ?? 0) > LIMITS.retailAndWarehouseSqm
    ? ["areaExceeded"]
    : [];
}

function checkAccommodationConditions(input: ComplianceInput): ReasonKey[] {
  if (!isAccommodation(input)) return [];

  const reasons: ReasonKey[] = [];
  if ((input.bedCount ?? 0) > LIMITS.accommodationBeds) reasons.push("accommodationBeds");
  if (input.hasOtherResidents === "yes") reasons.push("accommodationBuildingUse");
  if (input.hasWellnessFacilities === "yes") reasons.push("accommodationWellness");
  if (input.servesFullMeals === "yes") reasons.push("accommodationMeals");
  return reasons;
}

/**
 * Warum ein Betrieb eines GFVO-Sektors die Bedingungen seiner Kategorie NICHT
 * erfüllt. Hängt vom Sektor ab, nicht von der Kategorie, denn wer eine
 * Bedingung verletzt, hat keine Kategorie mehr.
 */
export function checkCategoryConditions(
  input: ComplianceInput
): readonly ReasonKey[] {
  return [...checkAreaLimit(input), ...checkAccommodationConditions(input)];
}