export type PaymentType = 'daily' | 'fixed';

export type Company = {
  id: string;
  name: string;
  baseLocation?: { latitude: number; longitude: number; };
  paymentType: PaymentType;
  dailyRate?: number; // Valor da diária
  fixedValue?: number; // Valor fixo mensal
  deliveryFee: number; // Valor padrão por entrega
};
