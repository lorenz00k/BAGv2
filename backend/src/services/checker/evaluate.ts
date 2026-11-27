import {
  determineGfvoCategory,
  isOperatingWindowCompliant,
} from "../compliance/gfvo-rules.js";
import {
  checkCategoryConditions,
  checkExclusions,
} from "../compliance/exclusion-checker.js";
import { toComplianceInput } from "./toComplianceInput.js";

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

export const HospitalitySubtypeValues = [
  "beherbergung",
  "iceSalon",
  "otherGastro",
] as const;
export const WorkshopSubtypeValues = [
  "tailor",
  "shoeService",
  "textilePickup",
  "otherWorkshop",
] as const;
export const OperatingPatternValues = [
  "gfvoWindow",
  "extendedHours",
  "roundTheClock",
] as const;

export type CheckerAnswers = {
  sector?: (typeof SectorValues)[number] | undefined;
  hospitalitySubtype?: (typeof HospitalitySubtypeValues)[number] | undefined;
  workshopSubtype?: (typeof WorkshopSubtypeValues)[number] | undefined;

  areaSqm?: number | undefined;
  personCount?: number | undefined;

  isStationary?: boolean | undefined;
  isOnlyTemporary?: boolean | undefined;

  bedCount?: number | undefined;
  hasOtherResidents?: boolean | undefined;
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
  "noFacility" | "freistellungGFVO" | "needsPermit" | "individualAssessment";

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
  | "freistellungSummary"
  | "freistellungSummary"
  | "closingHoursNote";

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

export type NextStepKey =
  | "contactMA36"
  | "prepareDocuments"
  | "checkZoning"
  | "consultExpert"
  | "noActionRequired";

export type DocumentHintKey =
  | "floorplan"
  | "fireProtectionReport"
  | "ventilationConcept"
  | "operatingDescription";

export type AuthorityHintKey = "ma36" | "none";

export type CheckerResult = {
  classification: ClassificationKey;
  reasons: ReasonKey[];
  gfvoCategory: GfvoCategoryKey | null;
  nextSteps: NextStepKey[];
  documentHints: DocumentHintKey[];
  authorityHint: AuthorityHintKey;
  rulesVersion: string;
};

const RULES_VERSION = "2026-11";

function pickNextSteps(classification: ClassificationKey): NextStepKey[] {
  switch (classification) {
    case "freistellungGFVO":
      return ["noActionRequired"];
    case "needsPermit":
      return ["contactMA36", "prepareDocuments"];
    case "individualAssessment":
      return ["contactMA36", "consultExpert"];
    case "noFacility":
      return ["noActionRequired"];
  }
}

function pickDocumentHints(
  classification: ClassificationKey,
  a: CheckerAnswers
): DocumentHintKey[] {
  if (
    classification === "freistellungGFVO" ||
    classification === "noFacility"
  ) {
    return [];
  }

  const docs: DocumentHintKey[] = ["floorplan", "operatingDescription"];
  if (a.hasExternalVentilation) docs.push("ventilationConcept");
  if (a.expectedImpairments) docs.push("fireProtectionReport");
  return docs;
}

function pickAuthorityHint(
  classification: ClassificationKey
): AuthorityHintKey {
  return classification === "freistellungGFVO" ||
    classification === "noFacility"
    ? "none"
    : "ma36";
}

/** Kategorien, bei denen die Freistellung nicht von den Öffnungszeiten abhängt (§ 1 Abs. 2 Schlussteil) */
const CLOSING_HOURS_NOTE_CATEGORIES: ReadonlySet<GfvoCategoryKey> = new Set([
  "accommodation",
  "iceSalon",
  "textilePickup",
]);

export function evaluate(a: CheckerAnswers): CheckerResult {
  const input = toComplianceInput(a);

  const build = (
    classification: ClassificationKey,
    reasons: ReasonKey[],
    gfvoCategory: GfvoCategoryKey | null
  ): CheckerResult => ({
    classification,
    reasons,
    gfvoCategory,
    nextSteps: pickNextSteps(classification),
    documentHints: pickDocumentHints(classification, a),
    authorityHint: pickAuthorityHint(classification),
    rulesVersion: RULES_VERSION,
  });

  // 1) Kein Betrieb im Sinne der GewO
  if (a.isStationary === false || a.isOnlyTemporary === true) {
    return build("noFacility", ["noFacilityDefinition"], null);
  }

  // 2) Infrastruktur / genehmigte Gesamtanlage (Z 12, Z 13): die Genehmigung
  //    des Standorts können wir nicht prüfen → Einzelfallprüfung
  if (a.locatedInInfrastructureSite || a.locatedInApprovedComplex) {
    const locationCategory =
      determineGfvoCategory({
        locatedInInfrastructureSite: input.locatedInInfrastructureSite,
        locatedInApprovedComplex: input.locatedInApprovedComplex,
        areaSqm: input.areaSqm,
      }) ?? null;
    return build(
      "individualAssessment",
      ["individualAssessment"],
      locationCategory
    );
  }

  const category = determineGfvoCategory(input) ?? null;

  // 3) Belästigungen zu erwarten → vermutlich genehmigungspflichtig
  if (a.expectedImpairments) {
    return build("needsPermit", ["expectedImpairments"], category);
  }

  // 4) Kein GFVO-Sektor → Einzelfallprüfung
  const conditionReasons = checkCategoryConditions(input);
  if (category === null && conditionReasons.length === 0) {
    return build("individualAssessment", ["individualAssessment"], null);
  }

  // 5) Ausschließungsgründe (§ 2) und verletzte Bedingungen → Genehmigung
  const blocking = [...checkExclusions(input).reasonKeys, ...conditionReasons];
  const outsideWindow = !isOperatingWindowCompliant(
    input,
    category ?? undefined
  );

  if (blocking.length > 0) {
    return build(
      "needsPermit",
      outsideWindow ? [...blocking, "operatingHours"] : blocking,
      category
    );
  }

  // 6) Nur die Öffnungszeiten sprechen gegen die Freistellung → Einzelfallprüfung
  if (outsideWindow) {
    return build("individualAssessment", ["operatingHours"], category);
  }

  // 7) Freigestellt. Öffnungszeiten sind hier neutral, aber Sperrstunden
  //    (§ 113 GewO) und Lieferzeiten gelten weiter.
  const reasons: ReasonKey[] = ["freistellungSummary"];
  if (
    category !== null &&
    CLOSING_HOURS_NOTE_CATEGORIES.has(category) &&
    a.operatingPattern !== "gfvoWindow"
  ) {
    reasons.push("closingHoursNote");
  }
  return build("freistellungGFVO", reasons, category);
}
