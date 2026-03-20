// Frontend mirror of backend/src/services/viennagis/types.ts
// Keep in sync with backend types.

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface Address {
  fullAddress: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  district: string;
  coordinates: Coordinates;
}

export interface AddressSuggestion {
  fullAddress: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  district: string;
  coordinates: Coordinates;
}

export type SuitabilityRisk = "low" | "medium" | "high";

// GeoJSON types (RFC 7946)
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon | GeoJSONMultiPolygon;

export interface POI {
  geometry?: GeoJSONGeometry;
  type: "krankenhaus" | "religion" | "kindergarten" | "schule" | "friedhof";
  name: string;
  distance: number;
  coordinates: Coordinates;
}

export interface ZoningInfo {
  geometry?: GeoJSONGeometry;
  widmung: string;
  widmungCode: string;
  details: string;
  found: boolean;
  risk: SuitabilityRisk;
  bauklasse?: string;
  bauweise?: string;
  note?: string;
  isBoundary?: boolean;
}

export interface NoiseInfo {
  geometry?: GeoJSONGeometry;
  risk?: SuitabilityRisk;
  level?: number;
  source?: string;
  category?: string;
  details: string;
  found: boolean;
}

export interface EnergyPlanInfo {
  geometry?: GeoJSONGeometry;
  risk?: SuitabilityRisk;
  zone?: string;
  planUrl?: string;
  regulationUrl?: string;
  details: string;
  found: boolean;
}

export interface FloodRiskInfo {
  geometry?: GeoJSONGeometry;
  risk?: SuitabilityRisk;
  riskLevel?: string;
  inFloodZone: boolean;
  details: string;
  found: boolean;
}

export interface WaterProtectionInfo {
  protectionZone?: string;
  restrictions?: string[];
  details: string;
  found: boolean;
}

export interface LoadingZone {
  type: string;
  distance: number;
  coordinates: Coordinates;
}

export interface TrafficZoneInfo {
  inPedestrianZone: boolean;
  inMeetingZone: boolean;
  restrictions?: string;
  details: string;
  found: boolean;
}

export interface PlanDocumentInfo {
  geometry?: GeoJSONGeometry;
  pdNummer?: string;
  url?: string;
  details: string;
  found: boolean;
}

export interface RealnutzungInfo {
  geometry?: GeoJSONGeometry;
  risk?: SuitabilityRisk;
  category?: string;
  usage?: string;
  usageDetail?: string;
  sensitivity: "hoch" | "mittel" | "gering";
  sensitivityReason: string;
  details: string;
  found: boolean;
}

// Aggregator types
export type TrafficLightColor = 'green' | 'yellow' | 'red' | 'gray';

export interface FactItem {
  label: string;
  value: string;
  note?: string;
}

export interface LayerResult {
  layerId: string;
  label: string;
  geometry?: GeoJSONGeometry;
  risk: SuitabilityRisk;
  color: TrafficLightColor;
  facts: FactItem[];
  available: boolean;
}

export interface ConflictWarning {
  description: string;
  layers: [string, string];
  severity: 'info' | 'warning' | 'critical';
}

export interface AggregatedResult {
  address?: Address;
  overallRisk: SuitabilityRisk;
  overallColor: TrafficLightColor;
  overallLabel: string;
  conflicts: ConflictWarning[];
  layers: LayerResult[];
  pois: POI[];
}

export interface ViennaGISResult {
  found: boolean;
  address?: Address;
  pois: POI[];
  zoning: ZoningInfo | undefined;
  planDocument: PlanDocumentInfo | undefined;
  noise: NoiseInfo | undefined;
  energyPlan: EnergyPlanInfo | undefined;
  realnutzung: RealnutzungInfo | undefined;
  floodRisk: FloodRiskInfo | undefined;
  waterProtection: WaterProtectionInfo | undefined;
  loadingZones: LoadingZone[];
  trafficZones: TrafficZoneInfo | undefined;
  aggregated?: AggregatedResult;
}
