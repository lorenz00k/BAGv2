export const SectorValues = [
  "retail",
  "office",
  "gastronomyHotel",
  "accommodation",
  "workshop",
  "warehouse",
  "cosmetics",
  "dataCenter",
  "selfService",
  "other",
] as const;

export const HospitalitySubtypeValues = ["beherbergung", "iceSalon", "otherGastro"] as const;
export const WorkshopSubtypeValues = ["tailor", "shoeService", "textilePickup", "otherWorkshop"] as const;
export const OperatingPatternValues = ["gfvoWindow", "extendedHours", "roundTheClock"] as const;

export type CheckerAnswers = {
  sector?: (typeof SectorValues)[number] | undefined;
  hospitalitySubtype?: (typeof HospitalitySubtypeValues)[number] | undefined;
  workshopSubtype?: (typeof WorkshopSubtypeValues)[number] | undefined;

  areaSqm?: number | undefined;
  personCount?: number | undefined;

  isStationary?: boolean | undefined;
  isOnlyTemporary?: boolean | undefined;

  bedCount?: number | undefined;
  buildingUseExclusive?: boolean | undefined;
  hasWellnessFacilities?: boolean | undefined;
  servesFullMeals?: boolean | undefined;

  zoningClarified?: boolean | undefined;
  buildingConsentPresent?: boolean | undefined;

  operatingPattern?: (typeof OperatingPatternValues)[number] | undefined;
  hasExternalVentilation?: boolean | undefined;
  storesRegulatedHazardous?: boolean | undefined;
  storesLabelledHazardous?: boolean | undefined;
  usesLoudMusic?: boolean | undefined;
  ippcOrSevesoRelevant?: boolean | undefined;

  expectedImpairments?: boolean | undefined;
  locatedInInfrastructureSite?: boolean | undefined;
  locatedInApprovedComplex?: boolean | undefined;
  existingPermitHistory?: boolean | undefined;
};

export type ClassificationKey =
  | "noFacility"
  | "freistellungGFVO"
  | "needsPermit"
  | "individualAssessment";

export type ReasonKey =
  | "externalVentilation"
  | "regulatedHazardousStorage"
  | "labelledHazardousStorage"
  | "musicExclusion"
  | "ippcSeveso"
  | "noFacilityDefinition"
  | "operatingHours"
  | "areaExceeded"
  | "accommodationBeds"
  | "accommodationBuildingUse"
  | "accommodationWellness"
  | "accommodationMeals"
  | "expectedImpairments"
  | "individualAssessment"
  | "freistellungSummary";

export type GfvoCategoryKey =
  | "retail"
  | "office"
  | "warehouse"
  | "cosmetics"
  | "tailor"
  | "textilePickup"
  | "accommodation"
  | "iceSalon"
  | "dataCenter"
  | "infrastructureSite"
  | "embeddedFacility";

export type CheckerResult = {
  classification: ClassificationKey;
  reasons: ReasonKey[];
  gfvoCategory: GfvoCategoryKey | null;
};

function pickGfvoCategory(a: CheckerAnswers): GfvoCategoryKey | null {
  if (a.locatedInInfrastructureSite) return "infrastructureSite";
  if (a.locatedInApprovedComplex) return "embeddedFacility";

  switch (a.sector) {
    case "retail":
    case "office":
    case "warehouse":
    case "cosmetics":
    case "dataCenter":
      return a.sector;
    case "workshop":
      if (a.workshopSubtype === "tailor") return "tailor";
      if (a.workshopSubtype === "textilePickup") return "textilePickup";
      return null;
    case "accommodation":
      return "accommodation";
    case "gastronomyHotel":
      if (a.hospitalitySubtype === "iceSalon") return "iceSalon";
      if (a.hospitalitySubtype === "beherbergung") return "accommodation";
      return null;
    default:
      return null;
  }
}

function collectBlockingReasons(a: CheckerAnswers): ReasonKey[] {
  const reasons: ReasonKey[] = [];
  //Operating time outside GFVO window → not exempt
  if (a.operatingPattern && a.operatingPattern !== "gfvoWindow") {
    reasons.push("operatingHours");
  }

  //GFVO exclusion checks 
  if (a.hasExternalVentilation) reasons.push("externalVentilation");
  if (a.storesRegulatedHazardous) reasons.push("regulatedHazardousStorage");
  if (a.storesLabelledHazardous) reasons.push("labelledHazardousStorage");
  if (a.usesLoudMusic) reasons.push("musicExclusion");
  if (a.ippcOrSevesoRelevant) reasons.push("ippcSeveso");

  // Simple category-specific constraints (MVP)
  // Retail size example appears in your content (<=600 m²)
  if (a.sector === "retail" && typeof a.areaSqm === "number" && a.areaSqm > 600) {
    reasons.push("areaExceeded");
  }
  // Accommodation constraints
  const isAccommodation =
    a.sector === "accommodation" || a.hospitalitySubtype === "beherbergung";

  if (isAccommodation && typeof a.bedCount === "number") {
    if (a.bedCount > 30) reasons.push("accommodationBeds");
    if (a.buildingUseExclusive === false) reasons.push("accommodationBuildingUse");
    if (a.hasWellnessFacilities) reasons.push("accommodationWellness");
    if (a.servesFullMeals) reasons.push("accommodationMeals");
  }

  return reasons;
}

export function evaluate(a: CheckerAnswers): CheckerResult {
  const gfvoCategory = pickGfvoCategory(a);

  // 1) Not a facility (mobile/temporary) → stop
  if (a.isStationary === false || a.isOnlyTemporary === true) {
    return { classification: "noFacility", reasons: ["noFacilityDefinition"], gfvoCategory: null };
  }

  // 2) Special contexts that usually need clarification
  if (a.locatedInInfrastructureSite || a.locatedInApprovedComplex) {
    return { classification: "individualAssessment", reasons: ["individualAssessment"], gfvoCategory };
  }

  // 3) If harmful impacts expected → permit likely
  if (a.expectedImpairments) {
    return { classification: "needsPermit", reasons: ["expectedImpairments"], gfvoCategory };
  }

  // 7) Decide
  const reasons = collectBlockingReasons(a);
  const gfvoPossible = gfvoCategory !== null && a.operatingPattern === "gfvoWindow";
  const hasBlockingReasons = reasons.length > 0;

  if (!gfvoPossible) {
    return { classification: "individualAssessment", reasons: ["individualAssessment"], gfvoCategory };
  }

  if (hasBlockingReasons) {
    return { classification: "needsPermit", reasons, gfvoCategory };
  }

  return { classification: "freistellungGFVO", reasons: ["freistellungSummary"], gfvoCategory };
}