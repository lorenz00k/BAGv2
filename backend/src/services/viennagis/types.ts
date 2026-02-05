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
  details: string;
  found: boolean;
}

export interface NoiseInfo {
  level?: number; // dB(A)
  source?: string; // "Straße", "Bahn", "Flughafen"
  category?: string; // "gering", "mittel", "hoch"
  details: string;
  found: boolean;
}

export interface EnergyPlanInfo {
  zone?: string; // "Fernwärmepflicht", "Keine Beschränkungen"
  restrictions?: string[]; // ["Gas verboten", "Fernwärme Pflicht"]
  details: string;
  found: boolean;
}

export interface FloodRiskInfo {
  riskLevel?: string; // "HQ30", "HQ100", "HQ300"
  inFloodZone: boolean;
  details: string;
  found: boolean;
}

export interface WaterProtectionInfo {
  protectionZone?: string; // "Schutzgebiet", "Schongebiet"
  restrictions?: string[]; // ["Ölabscheider Pflicht"]
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
  restrictions?: string; // "Zufahrt nur 06:00-10:00"
  details: string;
  found: boolean;
}

// ViennaGISResult erweitern
export interface ViennaGISResult {
  found: boolean;
  address?: Address;
  pois: POI[];
  zoning: ZoningInfo | undefined;
  noise: NoiseInfo | undefined;
  energyPlan: EnergyPlanInfo | undefined;     
  floodRisk: FloodRiskInfo | undefined;      
  waterProtection: WaterProtectionInfo | undefined; 
  loadingZones: LoadingZone[];                 
  trafficZones: TrafficZoneInfo | undefined;   
}