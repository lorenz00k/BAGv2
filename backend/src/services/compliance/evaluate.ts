/**
 * Main compliance evaluation orchestrator.
 *
 * Combines GFVO rules, exclusion checks, and document/duty resolvers
 * into a single pure function that produces the final ComplianceResult.
 *
 * This is the only public entry point for compliance evaluation.
 */

//adasüoifdhapshfpiuahsdfshapidfuh

import type {
  ClassificationType,
  ComplianceInput,
  ComplianceResult,
} from "../../types/compliance.js";

import { determineGfvoCategory, isOperatingWindowCompliant } from "./gfvo-rules.js";
import { checkExclusions, checkAccommodationReasons } from "./exclusion-checker.js";
import {
  resolveGeneralDocumentKeys,
  resolveSectorDocumentKeys,
  resolveSpecialNoteKeys,
  resolveProceduralKeys,
  resolveLabourKeys,
  resolveOperationalDutyKeys,
  resolveChangeDutyKeys,
  resolvePreCheckKeys,
  resolveQuickReferenceKeys,
  resolveDisclaimerKeys,
} from "./document-resolver.js";

// ---------------------------------------------------------------------------
// Classification title/summary key mapping
// ---------------------------------------------------------------------------

const CLASSIFICATION_KEYS: Record<
  ClassificationType,
  { title: string; summary: string }
> = {
  noFacility: {
    title: "complianceResult.classifications.noFacility.title",
    summary: "complianceResult.classifications.noFacility.summary",
  },
  freistellungGFVO: {
    title: "complianceResult.classifications.freistellungGFVO.title",
    summary: "complianceResult.classifications.freistellungGFVO.summary",
  },
  needsPermit: {
    title: "complianceResult.classifications.needsPermit.title",
    summary: "complianceResult.classifications.needsPermit.summary",
  },
  individualAssessment: {
    title: "complianceResult.classifications.individualAssessment.title",
    summary: "complianceResult.classifications.individualAssessment.summary",
  },
};

// ---------------------------------------------------------------------------
// Betriebsanlage determination
// ---------------------------------------------------------------------------

/**
 * A facility qualifies as a Betriebsanlage when it is stationary
 * and not merely temporary.
 */
function isFacility(input: ComplianceInput): boolean {
  return (
    input.isStationary === "yes" &&
    (input.isOnlyTemporary === "no" || input.isOnlyTemporary === undefined)
  );
}

// ---------------------------------------------------------------------------
// Area limit check
// ---------------------------------------------------------------------------

function checkAreaExceeded(
  input: ComplianceInput,
  gfvoCategoryKey: string | undefined
): string | undefined {
  if (
    (gfvoCategoryKey === "retail" || gfvoCategoryKey === "warehouse") &&
    (input.areaSqm ?? 0) > 600
  ) {
    return "complianceResult.reasons.areaExceeded";
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Classification determination
// ---------------------------------------------------------------------------

function determineClassification(
  hasPermitReasons: boolean,
  hasExpectedImpairments: boolean,
  gfvoCategoryKey: string | undefined
): ClassificationType {
  if (hasPermitReasons || hasExpectedImpairments) {
    return "needsPermit";
  }

  if (gfvoCategoryKey) {
    return "freistellungGFVO";
  }

  return "individualAssessment";
}

// ---------------------------------------------------------------------------
// Build the "noFacility" early return
// ---------------------------------------------------------------------------

function buildNoFacilityResult(input: ComplianceInput): ComplianceResult {
  return {
    isBetriebsanlage: false,
    classification: "noFacility",
    classificationKey: CLASSIFICATION_KEYS.noFacility.title,
    summaryKey: CLASSIFICATION_KEYS.noFacility.summary,
    gfvoCategoryKey: undefined,
    reasonKeys: ["complianceResult.reasons.noFacilityDefinition"],
    proceduralKeys: [...resolveProceduralKeys()],
    documentGeneralKeys: [],
    documentSectorKeys: [...resolveSectorDocumentKeys(input)],
    labourKeys: [],
    operationalDutyKeys: [],
    changeDutyKeys: [],
    preCheckKeys: [...resolvePreCheckKeys()],
    specialNoteKeys:
      input.sector === "selfService"
        ? ["complianceResult.specialNotes.selfService"]
        : [],
    quickReferenceKeys: [...resolveQuickReferenceKeys()],
    disclaimerKeys: [...resolveDisclaimerKeys()],
  };
}

// ---------------------------------------------------------------------------
// Main evaluation function
// ---------------------------------------------------------------------------

/**
 * Evaluate the compliance status of a planned facility.
 *
 * This is a **pure function** with no side effects — it only takes
 * the validated input and returns a deterministic result.
 */
export function evaluateCompliance(input: ComplianceInput): ComplianceResult {
  // 1. Check if this is a Betriebsanlage at all
  if (!isFacility(input)) {
    return buildNoFacilityResult(input);
  }

  // 2. Determine GFVO exempt category
  const gfvoCategoryKey = determineGfvoCategory(input);

  // 3. Collect all reason keys
  const reasonKeys: string[] = [];

  // 3a. Core exclusion grounds (§ 2 GFVO)
  const exclusion = checkExclusions(input);
  reasonKeys.push(...exclusion.reasonKeys);

  // 3b. Operating window compliance
  if (!isOperatingWindowCompliant(input, gfvoCategoryKey)) {
    reasonKeys.push("complianceResult.reasons.operatingHours");
  }

  // 3c. Area limit exceeded
  const areaReason = checkAreaExceeded(input, gfvoCategoryKey);
  if (areaReason) {
    reasonKeys.push(areaReason);
  }

  // 3d. Accommodation-specific reasons
  const accommodationReasons = checkAccommodationReasons(input, gfvoCategoryKey);
  reasonKeys.push(...accommodationReasons);

  // 3e. Expected impairments (§ 74 Abs. 2 GewO)
  const hasExpectedImpairments = input.expectedImpairments === "yes";
  if (hasExpectedImpairments) {
    reasonKeys.push("complianceResult.reasons.expectedImpairments");
  }

  // 4. Determine classification
  const hasPermitReasons =
    exclusion.excluded ||
    reasonKeys.includes("complianceResult.reasons.operatingHours");

  const classification = determineClassification(
    hasPermitReasons,
    hasExpectedImpairments,
    gfvoCategoryKey
  );

  // 5. Add summary reason keys
  if (classification === "individualAssessment" && !gfvoCategoryKey) {
    reasonKeys.push("complianceResult.reasons.individualAssessment");
  }

  if (classification === "freistellungGFVO" && reasonKeys.length === 0) {
    reasonKeys.push("complianceResult.reasons.freistellungSummary");
  }

  // 6. Build result
  const keys = CLASSIFICATION_KEYS[classification];

  return {
    isBetriebsanlage: true,
    classification,
    classificationKey: keys.title,
    summaryKey: keys.summary,
    gfvoCategoryKey: gfvoCategoryKey
      ? `complianceResult.gfvoCategories.${gfvoCategoryKey}`
      : undefined,
    reasonKeys,
    proceduralKeys: [...resolveProceduralKeys()],
    documentGeneralKeys: [...resolveGeneralDocumentKeys(classification)],
    documentSectorKeys: [...resolveSectorDocumentKeys(input)],
    labourKeys: [...resolveLabourKeys()],
    operationalDutyKeys: [...resolveOperationalDutyKeys()],
    changeDutyKeys: [...resolveChangeDutyKeys()],
    preCheckKeys: [...resolvePreCheckKeys()],
    specialNoteKeys: [...resolveSpecialNoteKeys(input)],
    quickReferenceKeys: [...resolveQuickReferenceKeys()],
    disclaimerKeys: [...resolveDisclaimerKeys()],
  };
}
