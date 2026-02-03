export interface Bin {
  id: string | number;
  name?: string;
  lat: number;
  lng: number;
  status?: "active" | "inactive" | "maintenance" | string;
  fill_level?: number;
  capacity?: number;
}