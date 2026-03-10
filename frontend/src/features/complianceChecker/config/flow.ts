import type { components } from "@/lib/api/checker";

export type CheckerAnswers = components["schemas"]["CheckerAnswers"];
export type AnswerKey = keyof CheckerAnswers;

export type FieldKind = "radio" | "select" | "boolean" | "number";

export type FieldDef = {
  key: AnswerKey;
  kind: FieldKind;

  // Keys in sections.complianceChecker.form
  labelKey: string;
  helperKey?: string;
  placeholderKey?: string;

  options?: readonly string[];
  optionLabelPrefix?: string;
  optionDescriptionPrefix?: string;

  when?: (answers: Partial<CheckerAnswers>) => boolean;
  min?: number;
  step?: number;
};

export type StepDef = {
  id: string;
  titleKey: string;     // <-- neu/required
  helperKey?: string;   // <-- optional
  when?: (answers: Partial<CheckerAnswers>) => boolean;
  fields: FieldDef[];
};

export const flow: readonly StepDef[] = [
  {
    id: "basics",
    titleKey: "sector.question",
    helperKey: "sector.helper",
    fields: [
      {
        key: "sector",
        kind: "select",
        labelKey: "sector.question",
        helperKey: "sector.helper",
        options: [
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
        ] as const,
        optionLabelPrefix: "sector.options",
      },
      {
        key: "hospitalitySubtype",
        kind: "radio",
        labelKey: "hospitalitySubtype.question",
        options: ["beherbergung", "iceSalon", "otherGastro"] as const,
        optionLabelPrefix: "hospitalitySubtype.options",
        optionDescriptionPrefix: "hospitalitySubtype.descriptions",
        when: (a) => a.sector === "gastronomyHotel",
      },
      {
        key: "workshopSubtype",
        kind: "radio",
        labelKey: "workshopSubtype.question",
        options: ["tailor", "shoeService", "textilePickup", "otherWorkshop"] as const,
        optionLabelPrefix: "workshopSubtype.options",
        when: (a) => a.sector === "workshop",
      },

      { key: "areaSqm", kind: "number", labelKey: "areaSqm.label", placeholderKey: "areaSqm.placeholder", min: 0, step: 1 },
      { key: "personCount", kind: "number", labelKey: "personCount.label", placeholderKey: "personCount.placeholder", min: 0, step: 1 },

      { key: "isStationary", kind: "boolean", labelKey: "isStationary.question" },
      { key: "isOnlyTemporary", kind: "boolean", labelKey: "isOnlyTemporary.question" },
    ],
  },

  {
    id: "accommodation",
    titleKey: "accommodation.heading", // "bedCount.label"
    helperKey: "accommodation.helper",
    when: (a) => a.sector === "accommodation" || a.hospitalitySubtype === "beherbergung",
    fields: [
      {
        key: "bedCount",
        kind: "number",
        labelKey: "bedCount.label",
        placeholderKey: "bedCount.placeholder",
        min: 0,
        step: 1
      },
      {
        key: "buildingUseExclusive",
        kind: "boolean",
        labelKey: "buildingUseExclusive.question"
      },
      {
        key: "hasWellnessFacilities",
        kind: "boolean",
        labelKey: "hasWellnessFacilities.question"
      },
      {
        key: "servesFullMeals",
        kind: "boolean",
        labelKey: "servesFullMeals.question"
      },
    ],
  },

  {
    id: "location",
    titleKey: "location.heading",
    helperKey: "location.helper",
    fields: [
      { key: "zoningClarified", kind: "boolean", labelKey: "zoningClarified.question" },
      { key: "buildingConsentPresent", kind: "boolean", labelKey: "buildingConsentPresent.question" },
    ],
  },

  {
    id: "operations",
    titleKey: "operations.heading",
    helperKey: "operations.helper",
    fields: [
      {
        key: "operatingPattern",
        kind: "radio",
        labelKey: "operatingPattern.question",
        options: ["gfvoWindow", "extendedHours", "roundTheClock"] as const,
        optionLabelPrefix: "operatingPattern.options",
        optionDescriptionPrefix: "operatingPattern.descriptions",
      },
      { key: "hasExternalVentilation", kind: "boolean", labelKey: "hasExternalVentilation.question" },
      { key: "storesRegulatedHazardous", kind: "boolean", labelKey: "storesRegulatedHazardous.question" },
      { key: "storesLabelledHazardous", kind: "boolean", labelKey: "storesLabelledHazardous.question" },
      { key: "usesLoudMusic", kind: "boolean", labelKey: "usesLoudMusic.question" },
      { key: "ippcOrSevesoRelevant", kind: "boolean", labelKey: "ippcOrSevesoRelevant.question" },
    ],
  },

  {
    id: "context",
    titleKey: "context.heading",
    helperKey: "context.helper",
    fields: [
      { key: "expectedImpairments", kind: "boolean", labelKey: "expectedImpairments.question" },
      { key: "locatedInInfrastructureSite", kind: "boolean", labelKey: "locatedInInfrastructureSite.question" },
      { key: "locatedInApprovedComplex", kind: "boolean", labelKey: "locatedInApprovedComplex.question" },
      { key: "existingPermitHistory", kind: "boolean", labelKey: "existingPermitHistory.question" },
    ],
  },
] as const;