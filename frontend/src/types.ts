export interface Bin {
  id: string | number;
  name?: string;
  lat: number;
  lng: number;
  status?: "active" | "inactive" | "maintenance" | string;
  fill_level?: number;
  capacity?: number;
}


export interface DetectionResult {
  waste_type: string
  confidence: number
  estimated_value: number
}
