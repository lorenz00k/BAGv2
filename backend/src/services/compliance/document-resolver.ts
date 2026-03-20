/**
 * Resolves which i18n keys should appear in each result section
 * based on the compliance classification and input data.
 *
 * All functions are pure — no side effects, no DB access.
 */

import type { ClassificationType, ComplianceInput } from "../../types/compliance.js";

// ---------------------------------------------------------------------------
// Key constants (match i18n JSON structure)
// ---------------------------------------------------------------------------

const GENERAL_DOCUMENT_KEYS: readonly string[] = [
  "complianceResult.documents.general.application",
  "complianceResult.documents.general.description",
  "complianceResult.documents.general.sitePlans",
  "complianceResult.documents.general.ventilationPlan",
  "complianceResult.documents.general.machineList",
  "complianceResult.documents.general.emissionStatement",
  "complianceResult.documents.general.wasteConcept",
  "complianceResult.documents.general.wasteWater",
];

const GASTRO_DOCUMENT_KEYS: readonly string[] = [
  "complianceResult.documents.sector.gastroExhaust",
  "complianceResult.documents.sector.guestSanitary",
  "complianceResult.documents.sector.hygiene",
];

const LABOUR_KEYS: readonly string[] = [
  "complianceResult.labour.roomHeight",
  "complianceResult.labour.daylight",
  "complianceResult.labour.ventilation",
  "complianceResult.labour.exhaustDischarge",
  "complianceResult.labour.escapeRoutes",
  "complianceResult.labour.escapeWidths",
  "complianceResult.labour.emergencyDoors",
  "complianceResult.labour.safetyLighting",
  "complianceResult.labour.staffSanitary",
];

const OPERATIONAL_DUTY_KEYS: readonly string[] = [
  "complianceResult.operationalDuties.startAfterPermit",
  "complianceResult.operationalDuties.periodicInspection",
  "complianceResult.operationalDuties.inspectionScope",
  "complianceResult.operationalDuties.inspectionCertificate",
  "complianceResult.operationalDuties.deficiencyDuties",
];

const CHANGE_DUTY_KEYS: readonly string[] = [
  "complianceResult.changeDuties.notifyChanges",
  "complianceResult.changeDuties.operationAfterNotice",
];

const PRE_CHECK_KEYS: readonly string[] = [
  "complianceResult.preCheck.contactChamber",
  "complianceResult.preCheck.clarifyBuildingLaw",
  "complianceResult.preCheck.engageNeighbours",
  "complianceResult.preCheck.reviewOSH",
  "complianceResult.preCheck.clarifyPermitNeed",
  "complianceResult.preCheck.prepareCompleteSet",
];

const PROCEDURAL_KEYS: readonly string[] = [
  "complianceResult.procedural.authority",
  "complianceResult.procedural.projectProcedure",
  "complianceResult.procedural.permitEffect",
  "complianceResult.procedural.eignungsfeststellung",
  "complianceResult.procedural.projectSprech",
  "complianceResult.procedural.feeHint",
];

const QUICK_REFERENCE_KEYS: readonly string[] = [
  "complianceResult.quickReferences.definition",
  "complianceResult.quickReferences.gfvo",
  "complianceResult.quickReferences.guideline",
  "complianceResult.quickReferences.gastro",
  "complianceResult.quickReferences.procedure",
  "complianceResult.quickReferences.section82b",
];

const DISCLAIMER_KEYS: readonly string[] = [
  "complianceResult.disclaimer.orientation",
  "complianceResult.disclaimer.legal",
];

const SELF_SERVICE_NOTE = "complianceResult.specialNotes.selfService";
const BUILDING_PROCEDURE_NOTE =
  "complianceResult.specialNotes.buildingProcedure";
const EXISTING_PERMITS_NOTE = "complianceResult.specialNotes.existingPermits";

// ---------------------------------------------------------------------------
// Public resolvers
// ---------------------------------------------------------------------------

/**
 * General documents are only required when a permit or
 * individual assessment is needed.
 */
export function resolveGeneralDocumentKeys(
  classification: ClassificationType
): readonly string[] {
  if (classification === "needsPermit" || classification === "individualAssessment") {
    return [...GENERAL_DOCUMENT_KEYS];
  }
  return [];
}

/**
 * Sector-specific document keys (currently only gastro/accommodation).
 */
export function resolveSectorDocumentKeys(
  input: ComplianceInput
): readonly string[] {
  const isGastro =
    input.sector === "gastronomyHotel" ||
    input.sector === "accommodation" ||
    input.hospitalitySubtype === "beherbergung";

  return isGastro ? [...GASTRO_DOCUMENT_KEYS] : [];
}

/**
 * Special notes vary by sector, history and classification.
 */
export function resolveSpecialNoteKeys(
  input: ComplianceInput
): readonly string[] {
  const notes: string[] = [];

  if (input.sector === "selfService") {
    notes.push(SELF_SERVICE_NOTE);
  }

  notes.push(BUILDING_PROCEDURE_NOTE);

  if (input.existingPermitHistory === "yes") {
    notes.push(EXISTING_PERMITS_NOTE);
  }

  return notes;
}

// --- Static key resolvers (always the same set) ---

export function resolveProceduralKeys(): readonly string[] {
  return [...PROCEDURAL_KEYS];
}

export function resolveLabourKeys(): readonly string[] {
  return [...LABOUR_KEYS];
}

export function resolveOperationalDutyKeys(): readonly string[] {
  return [...OPERATIONAL_DUTY_KEYS];
}

export function resolveChangeDutyKeys(): readonly string[] {
  return [...CHANGE_DUTY_KEYS];
}

export function resolvePreCheckKeys(): readonly string[] {
  return [...PRE_CHECK_KEYS];
}

export function resolveQuickReferenceKeys(): readonly string[] {
  return [...QUICK_REFERENCE_KEYS];
}

export function resolveDisclaimerKeys(): readonly string[] {
  return [...DISCLAIMER_KEYS];
}
