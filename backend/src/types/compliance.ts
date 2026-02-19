import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums (as Zod schemas → inferred types)
// ---------------------------------------------------------------------------

export const businessSectorSchema = z.enum([
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
]);

export const hospitalitySubtypeSchema = z.enum([
  "beherbergung",
  "iceSalon",
  "otherGastro",
]);

export const workshopSubtypeSchema = z.enum([
  "tailor",
  "shoeService",
  "textilePickup",
  "otherWorkshop",
]);

export const operatingPatternSchema = z.enum([
  "gfvoWindow",
  "extendedHours",
  "roundTheClock",
]);

export const booleanChoiceSchema = z.enum(["yes", "no"]);

export const classificationTypeSchema = z.enum([
  "noFacility",
  "freistellungGFVO",
  "needsPermit",
  "individualAssessment",
]);

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type BusinessSector = z.infer<typeof businessSectorSchema>;
export type HospitalitySubtype = z.infer<typeof hospitalitySubtypeSchema>;
export type WorkshopSubtype = z.infer<typeof workshopSubtypeSchema>;
export type OperatingPattern = z.infer<typeof operatingPatternSchema>;
export type BooleanChoice = z.infer<typeof booleanChoiceSchema>;
export type ClassificationType = z.infer<typeof classificationTypeSchema>;

// ---------------------------------------------------------------------------
// ComplianceInput – the data collected by the wizard
// ---------------------------------------------------------------------------

export const complianceInputSchema = z.object({
  sector: businessSectorSchema.optional(),
  hospitalitySubtype: hospitalitySubtypeSchema.optional(),
  workshopSubtype: workshopSubtypeSchema.optional(),

  areaSqm: z.number().positive().optional(),
  outdoorAreaSqm: z.number().nonnegative().optional(),
  bedCount: z.number().int().positive().optional(),
  personCount: z.number().int().positive().optional(),

  isStationary: booleanChoiceSchema.optional(),
  isOnlyTemporary: booleanChoiceSchema.optional(),

  zoningClarified: booleanChoiceSchema.optional(),
  buildingConsentPresent: booleanChoiceSchema.optional(),

  operatingPattern: operatingPatternSchema.optional(),
  hasExternalVentilation: booleanChoiceSchema.optional(),
  storesRegulatedHazardous: booleanChoiceSchema.optional(),
  storesLabelledHazardous: booleanChoiceSchema.optional(),
  usesLoudMusic: booleanChoiceSchema.optional(),
  ippcOrSevesoRelevant: booleanChoiceSchema.optional(),

  expectedImpairments: booleanChoiceSchema.optional(),
  locatedInInfrastructureSite: booleanChoiceSchema.optional(),
  locatedInApprovedComplex: booleanChoiceSchema.optional(),

  hasWellnessFacilities: booleanChoiceSchema.optional(),
  servesFullMeals: booleanChoiceSchema.optional(),
  buildingUseExclusive: booleanChoiceSchema.optional(),

  existingPermitHistory: booleanChoiceSchema.optional(),
});

export type ComplianceInput = z.infer<typeof complianceInputSchema>;

// ---------------------------------------------------------------------------
// ComplianceResult – the evaluation output
// ---------------------------------------------------------------------------

export interface ComplianceResult {
  isBetriebsanlage: boolean;
  classification: ClassificationType;
  classificationKey: string;
  summaryKey: string;
  gfvoCategoryKey: string | undefined;

  reasonKeys: string[];
  proceduralKeys: string[];
  documentGeneralKeys: string[];
  documentSectorKeys: string[];
  labourKeys: string[];
  operationalDutyKeys: string[];
  changeDutyKeys: string[];
  preCheckKeys: string[];
  specialNoteKeys: string[];
  quickReferenceKeys: string[];
  disclaimerKeys: string[];
}
