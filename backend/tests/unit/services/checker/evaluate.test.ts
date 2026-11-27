import { describe, it, expect } from "vitest";
import { evaluate } from "../../../../src/services/checker/evaluate.js";
import type {
  CheckerAnswers,
  ClassificationKey,
  GfvoCategoryKey,
  ReasonKey,
} from "../../../../src/services/checker/evaluate.js";

const base: CheckerAnswers = {
  isStationary: true,
  isOnlyTemporary: false,
  operatingPattern: "gfvoWindow",
  hasExternalVentilation: false,
  storesRegulatedHazardous: false,
  storesLabelledHazardous: false,
  usesLoudMusic: false,
  ippcOrSevesoRelevant: false,
  expectedImpairments: false,
};

const hotel: CheckerAnswers = {
  ...base,
  sector: "accommodation",
  bedCount: 20,
  hasOtherResidents: false,
  hasWellnessFacilities: false,
  servesFullMeals: false,
};

type Expected = {
  classification: ClassificationKey;
  category: GfvoCategoryKey | null;
  reasons: ReasonKey[];
};

const cases: Array<
  [name: string, answers: CheckerAnswers, expected: Expected]
> = [
  [
    "mobil",
    { ...base, isStationary: false },
    {
      classification: "noFacility",
      category: null,
      reasons: ["noFacilityDefinition"],
    },
  ],
  [
    "nur vorübergehend",
    { ...base, isOnlyTemporary: true },
    {
      classification: "noFacility",
      category: null,
      reasons: ["noFacilityDefinition"],
    },
  ],

  [
    "Z 1: Einzelhandel 500 m²",
    { ...base, sector: "retail", areaSqm: 500 },
    {
      classification: "freistellungGFVO",
      category: "retail",
      reasons: ["freistellungSummary"],
    },
  ],
  [
    "Z 1: Einzelhandel 700 m² (Grund bleibt sichtbar)",
    { ...base, sector: "retail", areaSqm: 700 },
    {
      classification: "needsPermit",
      category: null,
      reasons: ["areaExceeded"],
    },
  ],
  [
    "Z 1: Einzelhandel, nur Zeiten außerhalb des Fensters",
    {
      ...base,
      sector: "retail",
      areaSqm: 500,
      operatingPattern: "extendedHours",
    },
    {
      classification: "individualAssessment",
      category: "retail",
      reasons: ["operatingHours"],
    },
  ],
  [
    "Z 1: Einzelhandel 700 m² und längere Zeiten",
    {
      ...base,
      sector: "retail",
      areaSqm: 700,
      operatingPattern: "extendedHours",
    },
    {
      classification: "needsPermit",
      category: null,
      reasons: ["areaExceeded", "operatingHours"],
    },
  ],

  [
    "Z 2: Büro",
    { ...base, sector: "office" },
    {
      classification: "freistellungGFVO",
      category: "office",
      reasons: ["freistellungSummary"],
    },
  ],
  [
    "Z 5: Schneiderei",
    { ...base, sector: "workshop", workshopSubtype: "tailor" },
    {
      classification: "freistellungGFVO",
      category: "tailor",
      reasons: ["freistellungSummary"],
    },
  ],
  [
    "Z 5: Schuhservice",
    { ...base, sector: "workshop", workshopSubtype: "shoeService" },
    {
      classification: "freistellungGFVO",
      category: "tailor",
      reasons: ["freistellungSummary"],
    },
  ],
  [
    "Z 10: Textilübernahme, Dauerbetrieb (Zeiten egal, Hinweis)",
    {
      ...base,
      sector: "workshop",
      workshopSubtype: "textilePickup",
      operatingPattern: "roundTheClock",
    },
    {
      classification: "freistellungGFVO",
      category: "textilePickup",
      reasons: ["freistellungSummary", "closingHoursNote"],
    },
  ],

  [
    "Z 8: Hotel im GFVO-Fenster",
    hotel,
    {
      classification: "freistellungGFVO",
      category: "accommodation",
      reasons: ["freistellungSummary"],
    },
  ],
  [
    "Z 8: Hotel mit längeren Zeiten (gleiche Einstufung, nur Hinweis)",
    { ...hotel, operatingPattern: "extendedHours" },
    {
      classification: "freistellungGFVO",
      category: "accommodation",
      reasons: ["freistellungSummary", "closingHoursNote"],
    },
  ],
  [
    "Z 8 lit. a: 31 Betten",
    { ...hotel, bedCount: 31 },
    {
      classification: "needsPermit",
      category: null,
      reasons: ["accommodationBeds"],
    },
  ],
  [
    "Z 8 lit. b: andere Bewohner",
    { ...hotel, hasOtherResidents: true },
    {
      classification: "needsPermit",
      category: null,
      reasons: ["accommodationBuildingUse"],
    },
  ],
  [
    "Z 8 lit. c: Wellness",
    { ...hotel, hasWellnessFacilities: true },
    {
      classification: "needsPermit",
      category: null,
      reasons: ["accommodationWellness"],
    },
  ],
  [
    "Z 8 lit. d: Vollverpflegung",
    { ...hotel, servesFullMeals: true },
    {
      classification: "needsPermit",
      category: null,
      reasons: ["accommodationMeals"],
    },
  ],
  [
    "Z 8: mehrere Gründe zugleich",
    { ...hotel, bedCount: 31, hasWellnessFacilities: true },
    {
      classification: "needsPermit",
      category: null,
      reasons: ["accommodationBeds", "accommodationWellness"],
    },
  ],
  [
    "Z 8: Hotel über gastronomyHotel + beherbergung",
    { ...hotel, sector: "gastronomyHotel", hospitalitySubtype: "beherbergung" },
    {
      classification: "freistellungGFVO",
      category: "accommodation",
      reasons: ["freistellungSummary"],
    },
  ],

  [
    "Z 9: Eissalon mit längeren Zeiten",
    {
      ...base,
      sector: "gastronomyHotel",
      hospitalitySubtype: "iceSalon",
      operatingPattern: "extendedHours",
    },
    {
      classification: "freistellungGFVO",
      category: "iceSalon",
      reasons: ["freistellungSummary", "closingHoursNote"],
    },
  ],
  [
    "Z 11: Rechenzentrum, Dauerbetrieb",
    { ...base, sector: "dataCenter", operatingPattern: "roundTheClock" },
    {
      classification: "freistellungGFVO",
      category: "dataCenter",
      reasons: ["freistellungSummary"],
    },
  ],

  [
    "§ 2: Rechenzentrum mit externer Kühlung",
    { ...base, sector: "dataCenter", hasExternalVentilation: true },
    {
      classification: "needsPermit",
      category: "dataCenter",
      reasons: ["externalVentilation"],
    },
  ],
  [
    "§ 2: mehrere Gründe, feste Reihenfolge",
    {
      ...base,
      sector: "retail",
      areaSqm: 80,
      hasExternalVentilation: true,
      ippcOrSevesoRelevant: true,
    },
    {
      classification: "needsPermit",
      category: "retail",
      reasons: ["externalVentilation", "ippcSeveso"],
    },
  ],
  [
    "§ 74 Abs. 2 GewO: Belästigungen zu erwarten",
    { ...base, sector: "retail", areaSqm: 80, expectedImpairments: true },
    {
      classification: "needsPermit",
      category: "retail",
      reasons: ["expectedImpairments"],
    },
  ],

  [
    "Z 12: Infrastrukturstandort",
    { ...base, sector: "other", locatedInInfrastructureSite: true },
    {
      classification: "individualAssessment",
      category: "infrastructureSite",
      reasons: ["individualAssessment"],
    },
  ],
  [
    "Z 13: Gesamtanlage 300 m²",
    { ...base, sector: "other", locatedInApprovedComplex: true, areaSqm: 300 },
    {
      classification: "individualAssessment",
      category: "embeddedFacility",
      reasons: ["individualAssessment"],
    },
  ],
  [
    "Z 13: Gesamtanlage 500 m² (über der Grenze, keine Kategorie)",
    { ...base, sector: "other", locatedInApprovedComplex: true, areaSqm: 500 },
    {
      classification: "individualAssessment",
      category: null,
      reasons: ["individualAssessment"],
    },
  ],

  [
    "anderer Sektor",
    { ...base, sector: "other" },
    {
      classification: "individualAssessment",
      category: null,
      reasons: ["individualAssessment"],
    },
  ],
  [
    "Werkstatt ohne passenden Subtyp",
    { ...base, sector: "workshop", workshopSubtype: "otherWorkshop" },
    {
      classification: "individualAssessment",
      category: null,
      reasons: ["individualAssessment"],
    },
  ],
];

describe("evaluate", () => {
  it.each(cases)("%s", (_name, answers, expected) => {
    const result = evaluate(answers);
    expect({
      classification: result.classification,
      category: result.gfvoCategory,
      reasons: result.reasons,
    }).toEqual(expected);
  });

  it("verlangt für freigestellte Betriebe keine Behörde", () => {
    const result = evaluate(hotel);
    expect(result.authorityHint).toBe("none");
    expect(result.nextSteps).toEqual(["noActionRequired"]);
  });

  it("verweist bei Genehmigungspflicht an die MA 36", () => {
    const result = evaluate({ ...hotel, bedCount: 31 });
    expect(result.authorityHint).toBe("ma36");
    expect(result.nextSteps).toContain("contactMA36");
  });

  it("akzeptiert 0 Betten, ohne abzustürzen", () => {
    expect(() => evaluate({ ...hotel, bedCount: 0 })).not.toThrow();
  });
});
