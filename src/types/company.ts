export type Company = {
  id: string;
  name: string;
  baseLocation?: { latitude: number; longitude: number; };
  // Futuramente: defaultDailyRate?: number;
};
