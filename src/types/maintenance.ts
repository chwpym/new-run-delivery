export type Maintenance = {
  id: string; // uuid
  date: string; // YYYY-MM-DD
  vehicleId: string;
  description: string;
  value: number;
  km: number;
};
