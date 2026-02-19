import type { ComplianceFormData, WizardStepConfig } from "./types";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

export const WIZARD_STEPS: WizardStepConfig[] = [
  // Step 1: Betriebsart
  {
    id: "sector",
    headingKey: "form.sector.question",
    helperKey: "form.sector.helper",
    fields: [
      {
        key: "sector",
        labelKey: "form.sector.question",
        type: "radio",
        optionsKey: "form.sector.options",
      },
    ],
  },

  // Step 2: Gastronomie/Hotel Subtype (conditional)
  {
    id: "hospitalitySubtype",
    headingKey: "form.hospitalitySubtype.question",
    condition: (data) => data.sector === "gastronomyHotel",
    fields: [
      {
        key: "hospitalitySubtype",
        labelKey: "form.hospitalitySubtype.question",
        type: "radio",
        optionsKey: "form.hospitalitySubtype.options",
        descriptionsKey: "form.hospitalitySubtype.descriptions",
      },
    ],
  },

  // Step 2b: Werkstatt Subtype (conditional)
  {
    id: "workshopSubtype",
    headingKey: "form.workshopSubtype.question",
    condition: (data) => data.sector === "workshop",
    fields: [
      {
        key: "workshopSubtype",
        labelKey: "form.workshopSubtype.question",
        type: "radio",
        optionsKey: "form.workshopSubtype.options",
      },
    ],
  },

  // Step 3: Eckdaten
  {
    id: "details",
    headingKey: "form.details.heading",
    helperKey: "form.details.helper",
    fields: [
      {
        key: "areaSqm",
        labelKey: "form.areaSqm.label",
        type: "number",
        placeholderKey: "form.areaSqm.placeholder",
      },
      {
        key: "personCount",
        labelKey: "form.personCount.label",
        type: "number",
        placeholderKey: "form.personCount.placeholder",
      },
      {
        key: "isStationary",
        labelKey: "form.isStationary.question",
        type: "boolean",
      },
      {
        key: "isOnlyTemporary",
        labelKey: "form.isOnlyTemporary.question",
        type: "boolean",
      },
      {
        key: "bedCount",
        labelKey: "form.bedCount.label",
        type: "number",
        placeholderKey: "form.bedCount.placeholder",
        condition: (data) =>
          data.sector === "accommodation" ||
          (data.sector === "gastronomyHotel" &&
            data.hospitalitySubtype === "beherbergung"),
      },
    ],
  },

  // Step 4: Beherbergungs-Spezifika (conditional)
  {
    id: "accommodationDetails",
    headingKey: "form.accommodationDetails.heading",
    helperKey: "form.accommodationDetails.helper",
    condition: (data) =>
      data.sector === "accommodation" ||
      (data.sector === "gastronomyHotel" &&
        data.hospitalitySubtype === "beherbergung"),
    fields: [
      {
        key: "buildingUseExclusive",
        labelKey: "form.buildingUseExclusive.question",
        type: "boolean",
      },
      {
        key: "hasWellnessFacilities",
        labelKey: "form.hasWellnessFacilities.question",
        type: "boolean",
      },
      {
        key: "servesFullMeals",
        labelKey: "form.servesFullMeals.question",
        type: "boolean",
      },
    ],
  },

  // Step 5: Standort & Baukonsens
  {
    id: "location",
    headingKey: "form.location.heading",
    helperKey: "form.location.helper",
    fields: [
      {
        key: "zoningClarified",
        labelKey: "form.zoningClarified.question",
        type: "boolean",
      },
      {
        key: "buildingConsentPresent",
        labelKey: "form.buildingConsentPresent.question",
        type: "boolean",
      },
    ],
  },

  // Step 6: Betriebsablauf & Emissionen
  {
    id: "operations",
    headingKey: "form.operations.heading",
    helperKey: "form.operations.helper",
    fields: [
      {
        key: "operatingPattern",
        labelKey: "form.operatingPattern.question",
        type: "radio",
        optionsKey: "form.operatingPattern.options",
        descriptionsKey: "form.operatingPattern.descriptions",
      },
      {
        key: "hasExternalVentilation",
        labelKey: "form.hasExternalVentilation.question",
        type: "boolean",
      },
      {
        key: "storesRegulatedHazardous",
        labelKey: "form.storesRegulatedHazardous.question",
        type: "boolean",
      },
      {
        key: "storesLabelledHazardous",
        labelKey: "form.storesLabelledHazardous.question",
        type: "boolean",
      },
      {
        key: "usesLoudMusic",
        labelKey: "form.usesLoudMusic.question",
        type: "boolean",
      },
      {
        key: "ippcOrSevesoRelevant",
        labelKey: "form.ippcOrSevesoRelevant.question",
        type: "boolean",
      },
    ],
  },

  // Step 7: Wirkungen & Sonderfälle
  {
    id: "context",
    headingKey: "form.context.heading",
    helperKey: "form.context.helper",
    fields: [
      {
        key: "expectedImpairments",
        labelKey: "form.expectedImpairments.question",
        type: "boolean",
      },
      {
        key: "locatedInInfrastructureSite",
        labelKey: "form.locatedInInfrastructureSite.question",
        type: "boolean",
      },
      {
        key: "locatedInApprovedComplex",
        labelKey: "form.locatedInApprovedComplex.question",
        type: "boolean",
      },
      {
        key: "existingPermitHistory",
        labelKey: "form.existingPermitHistory.question",
        type: "boolean",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns only the steps that should be visible given the current form data.
 * Steps with a `condition` function are filtered accordingly.
 */
export function getVisibleSteps(
  data: ComplianceFormData
): WizardStepConfig[] {
  return WIZARD_STEPS.filter((step) => !step.condition || step.condition(data));
}

/**
 * Returns visible fields within a step, respecting per-field conditions.
 */
export function getVisibleFields(
  step: WizardStepConfig,
  data: ComplianceFormData
) {
  return step.fields.filter((field) => !field.condition || field.condition(data));
}
