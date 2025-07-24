"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PricingCard } from "@/components/settings/PricingCard";
import yearlyPlans from "@/lib/constants/yearlyPlans.json";
import strategies from "@/lib/constants/strategies.json";

export const { ALL_STRATEGIES, ALL_PROMPTS, ALL_FEATURES } = strategies;

const monthlyPlans = yearlyPlans.map((plan) => ({
  ...plan,
  price: plan.oldPrice,
  savings: "$0.00",
}));

// Transform strategy list into array of { includes: boolean, title: string }
function enhanceStrategies(plan: any) {
  return {
    ...plan,
    features: ALL_FEATURES.map((feature) => ({
      title: feature,
      includes: plan.features.includes(feature),
    })),
    prompt_features: ALL_PROMPTS.map((prompt) => ({
      title: prompt,
      includes: plan.prompt_features.includes(prompt),
    })),
    strategies: ALL_STRATEGIES.map((strategy) => ({
      title: strategy,
      includes: plan.strategies.includes(strategy),
    })),
  };
}

const yearlyEnhanced = yearlyPlans.map(enhanceStrategies);
const monthlyEnhanced = monthlyPlans.map(enhanceStrategies);

export function SubscriptionSection() {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const plans = billing === "yearly" ? yearlyEnhanced : monthlyEnhanced;

  return (
    <div className="p-4">
      <div className="flex justify-center mb-6">
        <ToggleGroup
          type="single"
          value={billing}
          onValueChange={(val) =>
            val && setBilling(val as "yearly" | "monthly")
          }
        >
          <ToggleGroupItem value="yearly" className="cursor-pointer px-4">
            Yearly -20%
          </ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="cursor-pointer px-4">
            Monthly
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {plans.map((plan) => (
          <div key={plan.tier} className="h-full">
            <PricingCard key={plan.tier} plan={plan} billing={billing} />
          </div>
        ))}
      </div>
    </div>
  );
}
