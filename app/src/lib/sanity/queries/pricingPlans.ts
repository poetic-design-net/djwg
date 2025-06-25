import groq from 'groq';

export interface PricingPlan {
  _id: string;
  key: string;
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  interval: string;
  intervalCount: number;
  features: string[];
}

export const pricingPlansQuery = groq`
  *[_type == "pricingPlan"] | order(price asc) {
    _id,
    key,
    id,
    name,
    description,
    price,
    originalPrice,
    interval,
    intervalCount,
    features
  }
`;
