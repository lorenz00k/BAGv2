// Core Types
export interface Coordinates {
  lng: number; // WGS84 Longitude
  lat: number; // WGS84 Latitude
}

export interface Address {
  fullAddress: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  district: string;
  coordinates: Coordinates;
}

// GeoJSON types (RFC 7946)
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // array of linear rings
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
  distance: number; // Meter
  coordinates: Coordinates;
}

export interface ZoningInfo {
  geometry?: GeoJSONGeometry;
  widmung: string;     // "Gemischtes Baugebiet-Geschäftsviertel"
  widmungCode: string; // "GBGV5"
  details: string;     // "Gemischtes Baugebiet-Geschäftsviertel Bauklasse 5"
  found: boolean;
  risk: SuitabilityRisk;
  bauklasse?: string;
  bauweise?: string;
  note?: string;
  isBoundary?: boolean;
}



/**
 * Interface für die erweiterte Analyse
 */
export interface DetailedSuitability {
  label: string;
  risk: SuitabilityRisk;
  note: string;
  bauklasse: string;
  bauweise: string;
}



export interface NoiseInfo {
  geometry?: GeoJSONGeometry;
  risk?: SuitabilityRisk;
  level?: number | undefined; // dB(A)
  source?: string | undefined; // "Straße", "Bahn", "Flughafen"
  category?: string | undefined; // "gering", "mittel", "hoch"
  details: string;
  found: boolean;
}

export interface EnergyPlanInfo {
  geometry?: GeoJSONGeometry;
  risk?: SuitabilityRisk;
  zone?: string | undefined;          // ERPLABEL, z.B. "7/001/1"
  planUrl?: string | undefined;       // Link zum Plan-PDF
  regulationUrl?: string | undefined; // Link zur Verordnung-PDF
  details: string;
  found: boolean;
}

export interface FloodRiskInfo {
  geometry?: GeoJSONGeometry;
  risk?: SuitabilityRisk;
  riskLevel?: string | undefined; // "HQ30", "HQ100", "HQ300"
  inFloodZone: boolean;
  details: string;
  found: boolean;
}

export interface WaterProtectionInfo {
  protectionZone?: string | undefined; // "Schutzgebiet", "Schongebiet"
  restrictions?: string[] | undefined; // ["Ölabscheider Pflicht"]
  details: string;
  found: boolean;
}

export interface LoadingZone {
  type: string; // "Ladezone", "Lieferzone"
  distance: number; // Meter
  coordinates: Coordinates;
}

export interface TrafficZoneInfo {
  inPedestrianZone: boolean;
  inMeetingZone: boolean;
  restrictions?: string | undefined; // "Zufahrt nur 06:00-10:00"
  details: string;
  found: boolean;
}

export interface PlanDocumentInfo {
  geometry?: GeoJSONGeometry;
  pdNummer?: string | undefined;        // Plandokument-Nummer, z.B. "8200"
  url?: string | undefined;             // Direkt-Link zum Plandokument
  details: string;
  found: boolean;
}

export interface RealnutzungInfo {
  geometry?: GeoJSONGeometry;
  risk?: SuitabilityRisk;
  category?: string | undefined;        // NUTZUNG_LEVEL1: "Baulandnutzung"
  usage?: string | undefined;           // NUTZUNG_LEVEL2: "Geschäfts,- Kern- und Mischnutzung"
  usageDetail?: string | undefined;     // NUTZUNG_LEVEL3: "Geschäfts-, Kern- u. Mischgebiete"
  sensitivity: "hoch" | "mittel" | "gering";
  sensitivityReason: string;
  details: string;
  found: boolean;
}

export interface AddressSuggestion {
  fullAddress: string;  // "Mariahilfer Straße 20"
  street: string;       // "Mariahilfer Straße"
  houseNumber: string;  // "20"
  postalCode: string;   // "1070"
  district: string;     // "07"
  coordinates: Coordinates;
}

export type SuitabilityRisk = 'low' | 'medium' | 'high';

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

// ViennaGISResult erweitern
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
