// src/types/dailyEntry.ts
export type DailyEntry = {
  id: string; // Usaremos a data no formato AAAA-MM-DD como ID
  date: string; // Formato AAAA-MM-DD
  isDayOff: boolean; // Se foi um dia de folga
  companyId?: string;
  vehicleId?: string;
  deliveriesCount?: number;
  dailyRate?: number; // Diária recebida
  deliveryFee?: number; // Valor por entrega no dia
  totalFromDeliveries?: number; // Ganhos totais das entregas
  tips?: number; // Gorjetas
  totalEarned?: number; // Ganho total do dia (diária + entregas + gorjetas)
  startKm?: number;
  endKm?: number;
  kmDriven?: number;
};
