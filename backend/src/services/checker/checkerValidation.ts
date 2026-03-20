import { z } from "zod";
import {
    type CheckerAnswers,
    SectorValues,
    HospitalitySubtypeValues,
    WorkshopSubtypeValues,
    OperatingPatternValues,
} from "./evaluate.js";

export const answersSchema = z
    .object({
        sector: z.enum(SectorValues).optional(),
        hospitalitySubtype: z.enum(HospitalitySubtypeValues).optional(),
        workshopSubtype: z.enum(WorkshopSubtypeValues).optional(),

        areaSqm: z.number().int().min(0).optional(),
        personCount: z.number().int().min(0).optional(),

        isStationary: z.boolean().optional(),
        isOnlyTemporary: z.boolean().optional(),

        bedCount: z.number().int().min(0).optional(),
        buildingUseExclusive: z.boolean().optional(),
        hasWellnessFacilities: z.boolean().optional(),
        servesFullMeals: z.boolean().optional(),

        zoningClarified: z.boolean().optional(),
        buildingConsentPresent: z.boolean().optional(),

        operatingPattern: z.enum(OperatingPatternValues).optional(),
        hasExternalVentilation: z.boolean().optional(),
        storesRegulatedHazardous: z.boolean().optional(),
        storesLabelledHazardous: z.boolean().optional(),
        usesLoudMusic: z.boolean().optional(),
        ippcOrSevesoRelevant: z.boolean().optional(),

        expectedImpairments: z.boolean().optional(),
        locatedInInfrastructureSite: z.boolean().optional(),
        locatedInApprovedComplex: z.boolean().optional(),
        existingPermitHistory: z.boolean().optional(),
    })
    .strict();

export const saveAnswersSchema = z
    .object({
        answers: answersSchema,
    })
    .strict();

export type ValidatedCheckerAnswers = z.infer<typeof answersSchema>;

export type ValidationIssue = {
    path: [string, string];
    message: string;
};

export function normalizeAnswers(answers: CheckerAnswers): CheckerAnswers {
    const next: CheckerAnswers = { ...answers };

    if (next.sector !== "gastronomyHotel") {
        delete next.hospitalitySubtype;
    }

    if (next.sector !== "workshop") {
        delete next.workshopSubtype;
    }

    const needsAccommodationDetails =
        next.sector === "accommodation" || next.hospitalitySubtype === "beherbergung";

    if (!needsAccommodationDetails) {
        delete next.bedCount;
        delete next.buildingUseExclusive;
        delete next.hasWellnessFacilities;
        delete next.servesFullMeals;
    }

    return next;
}

function isMissing(value: unknown) {
    if (typeof value === "string") return value.length === 0;
    if (typeof value === "number") return !Number.isFinite(value);
    if (typeof value === "boolean") return false;
    return value === undefined || value === null;
}

export function validateRequiredAnswers(
    answers: CheckerAnswers
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const requireField = (key: keyof CheckerAnswers, message = "Required") => {
        if (isMissing(answers[key])) {
            issues.push({ path: ["answers", String(key)], message });
        }
    };

    requireField("sector");
    requireField("areaSqm");
    requireField("personCount");
    requireField("isStationary");
    requireField("isOnlyTemporary");

    if (answers.sector === "gastronomyHotel") {
        requireField("hospitalitySubtype");
    }

    if (answers.sector === "workshop") {
        requireField("workshopSubtype");
    }

    const needsAccommodationDetails =
        answers.sector === "accommodation" || answers.hospitalitySubtype === "beherbergung";

    if (needsAccommodationDetails) {
        requireField("bedCount");
        requireField("buildingUseExclusive");
        requireField("hasWellnessFacilities");
        requireField("servesFullMeals");
    }

    requireField("zoningClarified");
    requireField("buildingConsentPresent");
    requireField("operatingPattern");
    requireField("hasExternalVentilation");
    requireField("storesRegulatedHazardous");
    requireField("storesLabelledHazardous");
    requireField("usesLoudMusic");
    requireField("ippcOrSevesoRelevant");
    requireField("expectedImpairments");
    requireField("locatedInInfrastructureSite");
    requireField("locatedInApprovedComplex");
    requireField("existingPermitHistory");

    return issues;
}