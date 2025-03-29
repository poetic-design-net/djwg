export interface Feature {
  _type: string;
  text: string;
  info?: string;
}

export interface Ticket {
  _id: string;
  phase: string;
  title: string;
  description: string;
  features: Feature[];
  status: 'completed' | 'current' | 'coming-soon';
  price: number;
  currency: string;
  url?: string;
  buttonText?: string;
}