import type {
  ViennaGISResult,
  AggregatedResult,
  LayerResult,
  ConflictWarning,
  FactItem,
  SuitabilityRisk,
  TrafficLightColor,
} from "./types.js";

/**
 * Map risk level to traffic light color
 */
function riskToColor(risk: SuitabilityRisk): TrafficLightColor {
  const map: Record<SuitabilityRisk, TrafficLightColor> = {
    low: 'green',
    medium: 'yellow',
    high: 'red',
  };
  return map[risk];
}

/**
 * Build zoning layer result
 */
function buildZoningLayer(raw: ViennaGISResult): LayerResult {
  const z = raw.zoning;
  if (!z || !z.found) {
    return {
      layerId: 'zoning',
      label: 'Flächenwidmung',
      risk: 'medium',
      color: 'gray',
      facts: [],
      available: false,
    };
  }

  const facts: FactItem[] = [
    { label: 'Widmung', value: z.widmung },
    { label: 'Code', value: z.widmungCode },
    { label: 'Details', value: z.details },
  ];
  if (z.bauklasse) facts.push({ label: 'Bauklasse', value: z.bauklasse });
  if (z.bauweise) facts.push({ label: 'Bauweise', value: z.bauweise });
  if (z.note) facts.push({ label: 'Hinweis', value: z.note });
  if (z.isBoundary) facts.push({ label: 'Grenzlage', value: 'Ja' });

  return {
    layerId: 'zoning',
    label: 'Flächenwidmung',
    geometry: z.geometry,
    risk: z.risk,
    color: riskToColor(z.risk),
    facts,
    available: true,
  };
}

/**
 * Build noise layer result
 */
function buildNoiseLayer(raw: ViennaGISResult): LayerResult {
  const n = raw.noise;
  if (!n || !n.found) {
    return {
      layerId: 'noise',
      label: 'Lärm',
      risk: 'low',
      color: 'green',
      facts: [],
      available: false,
    };
  }

  const risk = n.risk ?? 'low';
  const facts: FactItem[] = [];
  if (n.level != null) facts.push({ label: 'Lärmpegel', value: `${n.level} dB(A)` });
  if (n.source) facts.push({ label: 'Quelle', value: n.source });
  if (n.category) facts.push({ label: 'Kategorie', value: n.category });
  facts.push({ label: 'Details', value: n.details });

  return {
    layerId: 'noise',
    label: 'Lärm',
    geometry: n.geometry,
    risk,
    color: riskToColor(risk),
    facts,
    available: true,
  };
}

/**
 * Build flood risk layer result
 */
function buildFloodRiskLayer(raw: ViennaGISResult): LayerResult {
  const f = raw.floodRisk;
  if (!f || !f.found) {
    return {
      layerId: 'floodRisk',
      label: 'Hochwasser',
      risk: 'low',
      color: 'green',
      facts: [],
      available: false,
    };
  }

  const risk = f.risk ?? 'medium';
  const facts: FactItem[] = [
    { label: 'In Gefahrenzone', value: f.inFloodZone ? 'Ja' : 'Nein' },
  ];
  if (f.riskLevel) facts.push({ label: 'Risikostufe', value: f.riskLevel });
  facts.push({ label: 'Details', value: f.details });

  return {
    layerId: 'floodRisk',
    label: 'Hochwasser',
    geometry: f.geometry,
    risk,
    color: riskToColor(risk),
    facts,
    available: true,
  };
}

/**
 * Build realnutzung layer result
 */
function buildRealnutzungLayer(raw: ViennaGISResult): LayerResult {
  const r = raw.realnutzung;
  if (!r || !r.found) {
    return {
      layerId: 'realnutzung',
      label: 'Realnutzung',
      risk: 'medium',
      color: 'gray',
      facts: [],
      available: false,
    };
  }

  const risk = r.risk ?? 'medium';
  const facts: FactItem[] = [];
  if (r.category) facts.push({ label: 'Kategorie', value: r.category });
  if (r.usage) facts.push({ label: 'Nutzung', value: r.usage });
  if (r.usageDetail) facts.push({ label: 'Detail', value: r.usageDetail });
  facts.push({ label: 'Sensibilität', value: r.sensitivity, note: r.sensitivityReason });

  return {
    layerId: 'realnutzung',
    label: 'Realnutzung',
    geometry: r.geometry,
    risk,
    color: riskToColor(risk),
    facts,
    available: true,
  };
}

/**
 * Build energy plan layer result
 */
function buildEnergyPlanLayer(raw: ViennaGISResult): LayerResult {
  const e = raw.energyPlan;
  if (!e || !e.found) {
    return {
      layerId: 'energyPlan',
      label: 'Energieraumplan',
      risk: 'medium',
      color: 'yellow',
      facts: [],
      available: false,
    };
  }

  const risk = e.risk ?? 'low';
  const facts: FactItem[] = [];
  if (e.zone) facts.push({ label: 'Zone', value: e.zone });
  if (e.planUrl) facts.push({ label: 'Plan-PDF', value: e.planUrl });
  if (e.regulationUrl) facts.push({ label: 'Verordnung', value: e.regulationUrl });
  facts.push({ label: 'Details', value: e.details });

  return {
    layerId: 'energyPlan',
    label: 'Energieraumplan',
    geometry: e.geometry,
    risk,
    color: riskToColor(risk),
    facts,
    available: true,
  };
}

/**
 * Build plan document layer result (informational only, no risk scoring)
 */
function buildPlanDocumentLayer(raw: ViennaGISResult): LayerResult {
  const p = raw.planDocument;
  if (!p || !p.found) {
    return {
      layerId: 'planDocument',
      label: 'Plandokument',
      risk: 'low',
      color: 'gray',
      facts: [],
      available: false,
    };
  }

  const facts: FactItem[] = [];
  if (p.pdNummer) facts.push({ label: 'PD-Nummer', value: p.pdNummer });
  if (p.url) facts.push({ label: 'Link', value: p.url });
  facts.push({ label: 'Details', value: p.details });

  return {
    layerId: 'planDocument',
    label: 'Plandokument',
    geometry: p.geometry,
    risk: 'low',
    color: 'green',
    facts,
    available: true,
  };
}

/**
 * Detect cross-layer conflicts
 */
function detectConflicts(raw: ViennaGISResult): ConflictWarning[] {
  const conflicts: ConflictWarning[] = [];

  const zoningCode = raw.zoning?.widmungCode?.toUpperCase() ?? '';
  const realnutzungCategory = raw.realnutzung?.category?.toLowerCase() ?? '';
  const realnutzungUsage = raw.realnutzung?.usage?.toLowerCase() ?? '';
  const realnutzungDetail = raw.realnutzung?.usageDetail?.toLowerCase() ?? '';
  const realnutzungAll = `${realnutzungCategory} ${realnutzungUsage} ${realnutzungDetail}`;

  const isZoningIndustrial = zoningCode.startsWith('IG') || zoningCode.startsWith('BB');
  const isZoningResidential = zoningCode.startsWith('W');
  const isRealnutzungResidential = realnutzungAll.includes('wohn');
  const isRealnutzungIndustrial = realnutzungAll.includes('industrie') || realnutzungAll.includes('gewerbe');

  // Zoning = Industrial but actual use = Residential
  if (isZoningIndustrial && isRealnutzungResidential) {
    conflicts.push({
      description: 'Widmung ist Industrie-/Betriebsgebiet, aber die tatsächliche Nutzung ist Wohngebiet.',
      layers: ['zoning', 'realnutzung'],
      severity: 'critical',
    });
  }

  // Zoning = Residential but actual use = Industrial
  if (isZoningResidential && isRealnutzungIndustrial) {
    conflicts.push({
      description: 'Widmung ist Wohngebiet, aber die tatsächliche Nutzung ist gewerblich/industriell.',
      layers: ['zoning', 'realnutzung'],
      severity: 'warning',
    });
  }

  // Flood zone + residential zoning
  if (raw.floodRisk?.inFloodZone && isZoningResidential) {
    conflicts.push({
      description: 'Standort liegt in einer Hochwasser-Gefahrenzone und ist als Wohngebiet gewidmet.',
      layers: ['floodRisk', 'zoning'],
      severity: 'warning',
    });
  }

  // High noise + residential zoning
  const noiseLevel = raw.noise?.level;
  if (noiseLevel != null && noiseLevel >= 65 && isZoningResidential) {
    conflicts.push({
      description: `Hohe Lärmbelastung (${noiseLevel} dB) in einem Wohngebiet.`,
      layers: ['noise', 'zoning'],
      severity: 'warning',
    });
  }

  return conflicts;
}

const RISK_SCORES: Record<SuitabilityRisk, number> = { low: 0, medium: 1, high: 2 };
const LAYER_WEIGHTS: Record<string, number> = {
  zoning: 5,
  realnutzung: 3,
  noise: 2,
  floodRisk: 2,
  energyPlan: 1,
};
const CONFLICT_PENALTIES: Record<string, number> = {
  critical: 0.5,
  warning: 0.2,
  info: 0,
};

/**
 * Compute overall risk as weighted average + conflict penalty
 */
function computeOverallRisk(
  layers: LayerResult[],
  conflicts: ConflictWarning[]
): SuitabilityRisk {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const layer of layers) {
    const weight = LAYER_WEIGHTS[layer.layerId];
    if (weight == null || !layer.available) continue;
    weightedSum += RISK_SCORES[layer.risk] * weight;
    totalWeight += weight;
  }

  let score = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Apply conflict penalties
  for (const conflict of conflicts) {
    score += CONFLICT_PENALTIES[conflict.severity] ?? 0;
  }

  if (score < 0.7) return 'low';
  if (score < 1.4) return 'medium';
  return 'high';
}

const OVERALL_LABELS: Record<SuitabilityRisk, string> = {
  low: 'Standort grundsätzlich geeignet',
  medium: 'Standort mit Einschränkungen geeignet',
  high: 'Standort kritisch – erhöhter Prüfbedarf',
};

/**
 * Format raw ViennaGIS result into an aggregated UI-ready structure
 */
export function formatResultForUI(raw: ViennaGISResult): AggregatedResult {
  const layers: LayerResult[] = [
    buildZoningLayer(raw),
    buildRealnutzungLayer(raw),
    buildNoiseLayer(raw),
    buildFloodRiskLayer(raw),
    buildEnergyPlanLayer(raw),
    buildPlanDocumentLayer(raw),
  ];

  const conflicts = detectConflicts(raw);
  const overallRisk = computeOverallRisk(layers, conflicts);

  return {
    address: raw.address,
    overallRisk,
    overallColor: riskToColor(overallRisk),
    overallLabel: OVERALL_LABELS[overallRisk],
    conflicts,
    layers,
    pois: raw.pois,
  };
}
