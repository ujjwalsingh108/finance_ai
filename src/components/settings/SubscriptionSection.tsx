"use client";

import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PricingCard } from "@/components/settings/PricingCard";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";

// -----------------
// Normalizer
// -----------------
function enhanceStrategies(plan: any) {
  const { features } = plan;
  const featureSet = features?.features || {};

  // --- Premium Tools ---
  const premiumTools = featureSet.premium_tools || {};
  const premiumToolsArray = Object.keys(premiumTools).map((tool) => ({
    title: tool,
    includes: premiumTools[tool],
  }));

  // --- Trading Strategies ---
  const tradingStrategies = featureSet.trading_strategies || {};
  const tradingStrategiesArray = Object.keys(tradingStrategies).map(
    (strat) => ({
      title: strat,
      includes: tradingStrategies[strat],
    })
  );

  // --- Flat features (boolean only, not objects) ---
  const otherFeaturesArray = Object.keys(featureSet)
    .filter((k) => typeof featureSet[k] === "boolean")
    .map((f) => ({
      title: f,
      includes: featureSet[f],
    }));

  // --- Prompts ---
  const prompt_features = [
    {
      title: `${features.prompts} Prompts`,
      includes: features.prompts > 0,
    },
    ...otherFeaturesArray,
  ];

  return {
    id: plan.id,
    name: plan.name,
    price: (plan.price_cents / 100).toFixed(2),
    currency: plan.currency,
    billing: plan.monthly ? "monthly" : "yearly",
    features: [...premiumToolsArray],
    prompt_features,
    strategies: tradingStrategiesArray,
  };
}

// -----------------
// Component
// -----------------
export function SubscriptionSection() {
  const supabase = createClient();

  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      const { data, error } = await supabase.from("billing_plans").select("*");

      if (error) {
        console.error("Error fetching billing_plans:", error);
      } else {
        // Normalize data
        const enhanced = data.map(enhanceStrategies);
        setPlans(enhanced);
      }
      setLoading(false);
    }
    fetchPlans();
  }, [supabase]);

  const filteredPlans = plans.filter((p) => p.billing === billing);

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

      {loading ? (
        <Loading message="Loading plans..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="h-full">
              <PricingCard plan={plan} billing={billing} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
