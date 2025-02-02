export interface Ticket {
  _id: string;
  phase: string;
  title: string;
  description: string;
  features: string[];
  status: 'completed' | 'current' | 'coming-soon';
  price: number;
  currency: string;
  url?: string;
}