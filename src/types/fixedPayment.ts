// src/types/fixedPayment.ts
export type FixedPayment = {
  id: string; // uuid
  date: string; // YYYY-MM-DD
  companyId: string;
  value: number; // Valor bruto recebido
  discounts?: number; // Valor dos descontos
  description: string;
};
