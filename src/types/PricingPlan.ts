// Define the Plan type
export type Plan = {
  tier: string;
  price: number; // current price (monthly)
  oldPrice?: number; // monthly price if discounted
  yearly?: number; // yearly price
  savings?: string; // e.g. "30%"
  prompts: number; // for monthly prompt usage
  prompt_features: { includes: boolean; title: string }[];
  strategies: { includes: boolean; title: string }[];
  features: { includes: boolean; title: string }[];
};
