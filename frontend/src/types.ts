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
  base_points: number
  points_to_earn: number
  estimated_value?: number  // deprecated, use base_points
}
