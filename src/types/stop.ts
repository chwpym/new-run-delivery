// src/types/stop.ts
export type StopStatus = 'pending' | 'confirmed' | 'ignored';

export type Stop = {
  id: string; // uuid
  timestamp: number; // Data.now()
  location: {
    latitude: number;
    longitude: number;
  };
  status: StopStatus;
};
