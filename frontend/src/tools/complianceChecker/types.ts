// ---------------------------------------------------------------------------
// Business domain types (mirrors backend types/compliance.ts)
// ---------------------------------------------------------------------------

export type BusinessSector =
  | "retail"
  | "office"
  | "gastronomyHotel"
  | "accommodation"
  | "workshop"
  | "warehouse"
  | "cosmetics"
  | "dataCenter"
  | "selfService"
  | "other";

export type HospitalitySubtype = "beherbergung" | "iceSalon" | "otherGastro";
export type WorkshopSubtype =
  | "tailor"
  | "shoeService"
  | "textilePickup"
  | "otherWorkshop";
export type OperatingPattern = "gfvoWindow" | "extendedHours" | "roundTheClock";
export type BooleanChoice = "yes" | "no";

export type ClassificationType =
  | "noFacility"
  | "freistellungGFVO"
  | "needsPermit"
  | "individualAssessment";

// ---------------------------------------------------------------------------
// Form data collected by the wizard
// ---------------------------------------------------------------------------

export interface ComplianceFormData {
  sector?: BusinessSector;
  hospitalitySubtype?: HospitalitySubtype;
  workshopSubtype?: WorkshopSubtype;

  areaSqm?: number;
  outdoorAreaSqm?: number;
  bedCount?: number;
  personCount?: number;

  isStationary?: BooleanChoice;
  isOnlyTemporary?: BooleanChoice;

  zoningClarified?: BooleanChoice;
  buildingConsentPresent?: BooleanChoice;

  operatingPattern?: OperatingPattern;
  hasExternalVentilation?: BooleanChoice;
  storesRegulatedHazardous?: BooleanChoice;
  storesLabelledHazardous?: BooleanChoice;
  usesLoudMusic?: BooleanChoice;
  ippcOrSevesoRelevant?: BooleanChoice;

  expectedImpairments?: BooleanChoice;
  locatedInInfrastructureSite?: BooleanChoice;
  locatedInApprovedComplex?: BooleanChoice;

  hasWellnessFacilities?: BooleanChoice;
  servesFullMeals?: BooleanChoice;
  buildingUseExclusive?: BooleanChoice;

  existingPermitHistory?: BooleanChoice;
}

// ---------------------------------------------------------------------------
// Evaluation result (returned by backend)
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

// ---------------------------------------------------------------------------
// Check entity (from DB)
// ---------------------------------------------------------------------------

export interface Check {
  id: string;
  userId: string;
  status: "draft" | "completed";
  currentStep: string;
  formData: ComplianceFormData & { result?: ComplianceResult };
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Wizard field configuration
// ---------------------------------------------------------------------------

export type FieldType = "radio" | "number" | "boolean";

export interface FieldConfig {
  /** Field key in ComplianceFormData */
  key: keyof ComplianceFormData;
  /** i18n key for the question/label */
  labelKey: string;
  /** Field type */
  type: FieldType;
  /** i18n prefix for options (for radio fields) */
  optionsKey?: string;
  /** i18n prefix for option descriptions */
  descriptionsKey?: string;
  /** i18n key for placeholder (for number fields) */
  placeholderKey?: string;
  /** Condition: only show this field if it returns true */
  condition?: (data: ComplianceFormData) => boolean;
}

export interface WizardStepConfig {
  /** Unique step identifier */
  id: string;
  /** i18n key for step heading */
  headingKey: string;
  /** i18n key for helper text (optional) */
  helperKey?: string;
  /** Fields rendered in this step */
  fields: FieldConfig[];
  /** Condition: only show this step if it returns true */
  condition?: (data: ComplianceFormData) => boolean;
}

// ---------------------------------------------------------------------------
// Wizard state
// ---------------------------------------------------------------------------

export type WizardState = "idle" | "saving" | "evaluating" | "error";
