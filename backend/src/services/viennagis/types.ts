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

export interface POI {
  type: "krankenhaus" | "religion" | "kindergarten" | "schule" | "friedhof";
  name: string;
  distance: number; // Meter
  coordinates: Coordinates;
}

export interface ZoningInfo {
  widmung: string; // "Wohngebiet", "Mischgebiet", etc.
  widmungCode: string; // "W", "G", "GB"
  bauklasse?: string | undefined;
  gbInfo?: string | undefined;
  details: string;
  found: boolean;
}

export interface NoiseInfo {
  level?: number | undefined; // dB(A)
  source?: string | undefined; // "Straße", "Bahn", "Flughafen"
  category?: string | undefined; // "gering", "mittel", "hoch"
  details: string;
  found: boolean;
}

export interface EnergyPlanInfo {
  zone?: string | undefined; // "Fernwärmepflicht", "Keine Beschränkungen"
  restrictions?: string[] | undefined; // ["Gas verboten", "Fernwärme Pflicht"]
  details: string;
  found: boolean;
}

export interface FloodRiskInfo {
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
  pdNummer?: string | undefined;        // Plandokument-Nummer, z.B. "8200"
  url?: string | undefined;             // Direkt-Link zum Plandokument
  details: string;
  found: boolean;
}

export interface RealnutzungInfo {
  category?: string | undefined;        // NUTZUNG_L1: "Baulandnutzung"
  usage?: string | undefined;           // NUTZUNG_L2: "Industrie- und Gewerbenutzung"
  usageDetail?: string | undefined;     // NUTZUNG_L3: "Industrie, produzierendes Gewerbe"
  sensitivity: "hoch" | "mittel" | "gering";
  sensitivityReason: string;
  details: string;
  found: boolean;
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
}