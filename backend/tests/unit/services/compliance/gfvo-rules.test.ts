import { describe, it, expect } from "vitest";
import {
  determineGfvoCategory,
  getOperatingWindowRegime,
  isOperatingWindowCompliant,
} from "../../../../src/services/compliance/gfvo-rules.js";
import { checkExclusions } from "../../../../src/services/compliance/exclusion-checker.js";
import type { ComplianceInput } from "../../../../src/types/compliance.js";

// Verweise: § 1 Abs. 1 Z x = Freistellungskategorie, § 1 Abs. 2 = Betriebszeiten,
// § 2 = Ausschließungsgründe der 2. Genehmigungsfreistellungsverordnung (2. GFVO).

// Ein Beherbergungsbetrieb, der alle Bedingungen der Kategorie "accommodation"
// erfüllt. Einzelne Fälle ändern genau ein Feld davon, damit sofort sichtbar
// ist, welche Bedingung der Fall prüft.
const validAccommodation: ComplianceInput = {
  sector: "accommodation",
  bedCount: 30,
  hasOtherResidents: "no",
};

describe("determineGfvoCategory", () => {
  const cases: Array<{
    name: string;
    input: ComplianceInput;
    expected: string | undefined;
  }> = [
    { name: "leere Eingabe", input: {}, expected: undefined },

    // § 1 Abs. 1 Z 1: Einzelhandel bis 600 m²
    {
      name: "§ 1 Abs. 1 Z 1: retail, 600 m² (Grenze)",
      input: { sector: "retail", areaSqm: 600 },
      expected: "retail",
    },
    {
      name: "§ 1 Abs. 1 Z 1: retail, 601 m²",
      input: { sector: "retail", areaSqm: 601 },
      expected: undefined,
    },
    {
      name: "§ 1 Abs. 1 Z 1: retail, Fläche fehlt",
      input: { sector: "retail" },
      expected: undefined,
    },

    // § 1 Abs. 1 Z 2: Büro, Fläche egal
    {
      name: "§ 1 Abs. 1 Z 2: office, 5000 m²",
      input: { sector: "office", areaSqm: 5000 },
      expected: "office",
    },

    // § 1 Abs. 1 Z 3: Lager bis 600 m²
    {
      name: "§ 1 Abs. 1 Z 3: warehouse, 600 m² (Grenze)",
      input: { sector: "warehouse", areaSqm: 600 },
      expected: "warehouse",
    },
    {
      name: "§ 1 Abs. 1 Z 3: warehouse, 601 m²",
      input: { sector: "warehouse", areaSqm: 601 },
      expected: undefined,
    },

    // § 1 Abs. 1 Z 4: Kosmetik, Fußpflege, Friseur, Massage, Bandagisten
    {
      name: "§ 1 Abs. 1 Z 4: cosmetics",
      input: { sector: "cosmetics" },
      expected: "cosmetics",
    },

    // § 1 Abs. 1 Z 5 und Z 10: Subtyp entscheidet
    {
      name: "§ 1 Abs. 1 Z 5: workshop + tailor",
      input: { sector: "workshop", workshopSubtype: "tailor" },
      expected: "tailor",
    },
    {
      name: "§ 1 Abs. 1 Z 5: workshop + shoeService (gleiche Ziffer wie Schneiderei)",
      input: { sector: "workshop", workshopSubtype: "shoeService" },
      expected: "tailor",
    },
    {
      name: "§ 1 Abs. 1 Z 10: workshop + textilePickup",
      input: { sector: "workshop", workshopSubtype: "textilePickup" },
      expected: "textilePickup",
    },
    {
      name: "workshop + otherWorkshop (keine Ziffer)",
      input: { sector: "workshop", workshopSubtype: "otherWorkshop" },
      expected: undefined,
    },
    {
      name: "workshop ohne Subtyp",
      input: { sector: "workshop" },
      expected: undefined,
    },

    // § 1 Abs. 1 Z 8: Beherbergung, alle Bedingungen müssen zusammen stimmen
    {
      name: "§ 1 Abs. 1 Z 8: accommodation, alle Bedingungen erfüllt (30 Betten)",
      input: validAccommodation,
      expected: "accommodation",
    },
    {
      name: "§ 1 Abs. 1 Z 8 lit. a: 31 Betten",
      input: { ...validAccommodation, bedCount: 31 },
      expected: undefined,
    },
    {
      name: "§ 1 Abs. 1 Z 8 lit. a: Bettenzahl fehlt",
      input: { ...validAccommodation, bedCount: undefined },
      expected: undefined,
    },
    // lit. b: andere gewerbliche Nutzung im Gebäude ist erlaubt, dauerhafte Bewohner außer dem Inhaber nicht.
    {
      name: "§ 1 Abs. 1 Z 8 lit. b: andere Bewohner im Gebäude",
      input: { ...validAccommodation, hasOtherResidents: "yes" },
      expected: undefined,
    },
    {
      name: "§ 1 Abs. 1 Z 8 lit. b: Bewohner-Angabe fehlt",
      input: { ...validAccommodation, hasOtherResidents: undefined },
      expected: undefined,
    },
    {
      name: "§ 1 Abs. 1 Z 8 lit. c: Wellness (Bäderhygienegesetz) vorhanden",
      input: { ...validAccommodation, hasWellnessFacilities: "yes" },
      expected: undefined,
    },
    {
      name: "§ 1 Abs. 1 Z 8 lit. d: Vollverpflegung",
      input: { ...validAccommodation, servesFullMeals: "yes" },
      expected: undefined,
    },
    {
      name: "§ 1 Abs. 1 Z 8 lit. c/d: Wellness/Verpflegung explizit 'no'",
      input: {
        ...validAccommodation,
        hasWellnessFacilities: "no",
        servesFullMeals: "no",
      },
      expected: "accommodation",
    },
    // Designentscheidung (keine Vorgabe des Gesetzes): fehlende Angaben zu Wellness/Verpflegung blockieren nicht.
    {
      name: "§ 1 Abs. 1 Z 8 lit. c/d: Wellness/Verpflegung fehlen (Designentscheidung: lenient)",
      input: {
        ...validAccommodation,
        hasWellnessFacilities: undefined,
        servesFullMeals: undefined,
      },
      expected: "accommodation",
    },
    {
      name: "§ 1 Abs. 1 Z 8: gastronomyHotel + beherbergung",
      input: {
        ...validAccommodation,
        sector: "gastronomyHotel",
        hospitalitySubtype: "beherbergung",
      },
      expected: "accommodation",
    },
    {
      name: "gastronomyHotel + otherGastro (keine Ziffer)",
      input: {
        ...validAccommodation,
        sector: "gastronomyHotel",
        hospitalitySubtype: "otherGastro",
      },
      expected: undefined,
    },
    {
      name: "gastronomyHotel ohne Subtyp",
      input: { ...validAccommodation, sector: "gastronomyHotel" },
      expected: undefined,
    },

    // § 1 Abs. 1 Z 9: Eissalon
    {
      name: "§ 1 Abs. 1 Z 9: gastronomyHotel + iceSalon",
      input: { sector: "gastronomyHotel", hospitalitySubtype: "iceSalon" },
      expected: "iceSalon",
    },

    // § 1 Abs. 1 Z 11: Rechenzentrum ohne Feuerungsanlagen, Verbrennungsmotor nur für Notstrom
    {
      name: "§ 1 Abs. 1 Z 11: dataCenter",
      input: { sector: "dataCenter" },
      expected: "dataCenter",
    },
    {
      name: "§ 1 Abs. 1 Z 11: dataCenter, keine Feuerung/Nicht-Notstrom-Motor ('no')",
      input: { sector: "dataCenter", hasNonEmergencyCombustion: "no" },
      expected: "dataCenter",
    },
    {
      name: "§ 1 Abs. 1 Z 11: dataCenter mit Feuerungsanlage oder Nicht-Notstrom-Motor",
      input: { sector: "dataCenter", hasNonEmergencyCombustion: "yes" },
      expected: undefined,
    },

    // § 1 Abs. 1 Z 12 und Z 13: Lage-basierte Kategorien (unabhängig vom Sektor)
    {
      name: "§ 1 Abs. 1 Z 12: Infrastrukturstandort, beliebiger Sektor",
      input: { sector: "other", locatedInInfrastructureSite: "yes" },
      expected: "infrastructureSite",
    },
    {
      name: "§ 1 Abs. 1 Z 12: Infrastrukturstandort 'no'",
      input: { sector: "other", locatedInInfrastructureSite: "no" },
      expected: undefined,
    },
    {
      name: "§ 1 Abs. 1 Z 13: genehmigter Komplex, 400 m² (Grenze)",
      input: { locatedInApprovedComplex: "yes", areaSqm: 400 },
      expected: "embeddedFacility",
    },
    {
      name: "§ 1 Abs. 1 Z 13: genehmigter Komplex, 401 m²",
      input: { locatedInApprovedComplex: "yes", areaSqm: 401 },
      expected: undefined,
    },
    {
      name: "§ 1 Abs. 1 Z 13: genehmigter Komplex, Fläche fehlt",
      input: { locatedInApprovedComplex: "yes" },
      expected: undefined,
    },

    // Reihenfolge der Regeln: der erste passende Treffer gewinnt
    {
      name: "Reihenfolge: retail 500 m² + Infrastruktur → retail gewinnt",
      input: {
        sector: "retail",
        areaSqm: 500,
        locatedInInfrastructureSite: "yes",
      },
      expected: "retail",
    },
    {
      name: "Reihenfolge: retail 700 m² + Infrastruktur → fällt durch",
      input: {
        sector: "retail",
        areaSqm: 700,
        locatedInInfrastructureSite: "yes",
      },
      expected: "infrastructureSite",
    },
  ];

  it.each(cases)("$name → $expected", ({ input, expected }) => {
    expect(determineGfvoCategory(input)).toBe(expected);
  });

  // Noch nicht im Modell abgebildet, bewusst als Erinnerung offen gelassen.
  it.todo("§ 1 Abs. 1 Z 6: Fotografenbetriebe (Kategorie fehlt im Modell)");
  it.todo(
    "§ 1 Abs. 1 Z 7: Dentalstudios/zahntechnische Labors (Kategorie fehlt im Modell)"
  );
  it.todo(
    "§ 1 Abs. 1 Z 12: Seilbahnanlagen? WKO nennt sie, im konsolidierten Text prüfen (RIS)"
  );
  it.todo(
    "§ 1 Abs. 1 Z 13 + Z 1–12: Kriterien bleiben bestehen, Betriebszeiten gelten als Z 13"
  );
});

describe("isOperatingWindowCompliant", () => {
  const cases: Array<{
    name: string;
    input: ComplianceInput;
    key: string | undefined;
    expected: boolean;
  }> = [
    // § 1 Abs. 2 Schlussteil: Z 8–10 ohne Betriebszeiten (Lieferverkehr bleibt beschränkt)
    {
      name: "Z 8 befreit (accommodation), extendedHours",
      input: { operatingPattern: "extendedHours" },
      key: "accommodation",
      expected: true,
    },
    {
      name: "Z 8 befreit (accommodation), roundTheClock",
      input: { operatingPattern: "roundTheClock" },
      key: "accommodation",
      expected: true,
    },
    {
      name: "Z 9 befreit (iceSalon), extendedHours",
      input: { operatingPattern: "extendedHours" },
      key: "iceSalon",
      expected: true,
    },
    {
      name: "Z 10 befreit (textilePickup), roundTheClock",
      input: { operatingPattern: "roundTheClock" },
      key: "textilePickup",
      expected: true,
    },

    // § 1 Abs. 2 Schlussteil: Z 11 und Z 12 ohne jede Zeitbeschränkung
    {
      name: "Z 11 befreit (dataCenter), roundTheClock",
      input: { operatingPattern: "roundTheClock" },
      key: "dataCenter",
      expected: true,
    },
    {
      name: "Z 12 befreit (infrastructureSite), roundTheClock",
      input: { operatingPattern: "roundTheClock" },
      key: "infrastructureSite",
      expected: true,
    },

    // § 1 Abs. 2 Z 1 und 2: nicht befreite Kategorien, nur das GFVO-Fenster erlaubt
    {
      name: "nicht befreit (retail), gfvoWindow",
      input: { operatingPattern: "gfvoWindow" },
      key: "retail",
      expected: true,
    },
    {
      name: "nicht befreit (retail), extendedHours",
      input: { operatingPattern: "extendedHours" },
      key: "retail",
      expected: false,
    },
    {
      name: "nicht befreit (retail), roundTheClock",
      input: { operatingPattern: "roundTheClock" },
      key: "retail",
      expected: false,
    },
    {
      name: "nicht befreit (retail), Muster fehlt (Designentscheidung: lenient)",
      input: {},
      key: "retail",
      expected: true,
    },
    {
      name: "nicht befreit (tailor), extendedHours",
      input: { operatingPattern: "extendedHours" },
      key: "tailor",
      expected: false,
    },

    // Z 13: das GFVO-Fenster gilt NICHT, es gelten die Zeiten des Generalgenehmigungsbescheids.
    // Das Tool kann diese Zeiten nicht prüfen und blockiert daher nicht.
    {
      name: "Z 13 (embeddedFacility): GFVO-Fenster gilt nicht, extendedHours blockiert nicht",
      input: { operatingPattern: "extendedHours" },
      key: "embeddedFacility",
      expected: true,
    },

    // Keine Kategorie
    {
      name: "ohne Kategorie, extendedHours",
      input: { operatingPattern: "extendedHours" },
      key: undefined,
      expected: false,
    },
    {
      name: "ohne Kategorie, gfvoWindow",
      input: { operatingPattern: "gfvoWindow" },
      key: undefined,
      expected: true,
    },
    {
      name: "ohne Kategorie, Muster fehlt",
      input: {},
      key: undefined,
      expected: true,
    },

    // Unbekannter Schlüssel darf nicht abstürzen und gilt als nicht befreit
    {
      name: "unbekannter Schlüssel, extendedHours",
      input: { operatingPattern: "extendedHours" },
      key: "foo",
      expected: false,
    },
  ];

  it.each(cases)("$name → $expected", ({ input, key, expected }) => {
    expect(isOperatingWindowCompliant(input, key)).toBe(expected);
  });

  // Z 13 ist die einzige Kategorie mit Zeiten aus dem Generalgenehmigungsbescheid.
  // Der Aufrufer braucht diese Information, um einen Hinweis anzuzeigen.
  it.each([
    ["retail", "gfvo"],
    ["accommodation", "none"],
    ["dataCenter", "none"],
    ["infrastructureSite", "none"],
    ["embeddedFacility", "generalPermit"],
    [undefined, "gfvo"],
    ["foo", "gfvo"],
  ] as const)("Betriebszeiten-Regime von %s → %s", (key, expected) => {
    expect(getOperatingWindowRegime(key)).toBe(expected);
  });

  it.todo(
    "Lieferverkehr-Zeiten (Mo–Fr 6–19, Sa 6–18) gelten auch für befreite Kategorien (nicht modelliert)"
  );
});

describe("checkExclusions (§ 2 der 2. GFVO)", () => {
  // Rechenzentren haben oft Kühlaggregate außerhalb der Gebäudehülle.
  // Das schließt die Freistellung nach § 2 Z 2 aus, auch wenn Z 11 sonst passt.
  it("§ 2 Z 2: dataCenter mit externer Lüftung/Kühlung wird ausgeschlossen", () => {
    const input: ComplianceInput = {
      sector: "dataCenter",
      hasExternalVentilation: "yes",
    };
    expect(determineGfvoCategory(input)).toBe("dataCenter");
    expect(checkExclusions(input).excluded).toBe(true);
  });

  it("§ 2 Z 2: dataCenter ohne externe Lüftung wird nicht ausgeschlossen", () => {
    const input: ComplianceInput = {
      sector: "dataCenter",
      hasExternalVentilation: "no",
    };
    expect(checkExclusions(input).excluded).toBe(false);
  });
});
