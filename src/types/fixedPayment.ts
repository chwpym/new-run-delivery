// src/types/fixedPayment.ts
export type FixedPayment = {
  id: string; // uuid
  date: string; // YYYY-MM-DD
  companyId: string;
  value: number;
  description: string;
};
