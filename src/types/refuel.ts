export type Refuel = {
  id: string; // uuid
  date: string; // YYYY-MM-DD
  vehicleId: string;
  value: number;
  liters: number;
  km: number; // KM no momento do abastecimento
};
