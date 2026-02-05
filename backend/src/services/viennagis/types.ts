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

export interface BuildingPlanInfo {
  bauklasse?: string; // "III" = 3 Vollgeschosse
  bebauungsdichte?: number; // 60 = max 60% Grundfläche
  bauhoehe?: number; // Meter
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

export interface TransitStop {
  type: "ubahn" | "tram" | "bus";
  line: string; // "U3", "6", "13A"
  name: string;
  distance: number; // Meter
  coordinates: Coordinates;
}

// Full Check Response
export interface ViennaGISResult {
  found: boolean;
  address?: Address;
  pois: POI[];
  zoning?: ZoningInfo;
  buildingPlan?: BuildingPlanInfo;
  noise?: NoiseInfo;
  transit: TransitStop[];
}