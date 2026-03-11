export type CostCategory = 'fixed' | 'variable';

export type Cost = {
  id: string; // uuid
  date: string; // YYYY-MM-DD
  description: string;
  value: number;
  category: CostCategory;
};
