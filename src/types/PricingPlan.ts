// Define the Plan type
export type Plan = {
  name: string;
  price: number; // current price (monthly)
  oldPrice?: number; // monthly price if discounted
  yearly?: number; // yearly price
  savings?: string; // e.g. "30%"
  prompts: number; // for monthly prompt usage
  prompt_features: { includes: boolean; title: string }[];
  strategies: { includes: boolean; title: string }[];
  features: { includes: boolean; title: string }[];
};

// types/PricingPlan.ts
export type RawPlan = {
  tier: string;
  price: number;
  oldPrice: number;
  yearly: number;
  savings: string;
  prompts: number;
  prompt_features: string[];
  strategies: string[];
  features: string[];
  extraStrategies?: string[];
};
