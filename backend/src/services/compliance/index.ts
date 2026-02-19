/**
 * Public API for the compliance evaluation service.
 *
 * Import from here instead of reaching into individual modules.
 */

export { evaluateCompliance } from "./evaluate.js";
export { determineGfvoCategory, isOperatingWindowCompliant } from "./gfvo-rules.js";
export { checkExclusions, checkAccommodationReasons } from "./exclusion-checker.js";
export {
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
