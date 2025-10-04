"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Plan } from "@/types/PricingPlan";

export function PricingCard({
  plan,
  billing,
}: {
  plan: Plan;
  billing: "monthly" | "yearly";
}) {
  const displayPrice = plan.price;
  const monthlyPrice =
    billing === "yearly"
      ? displayPrice && (displayPrice / 12).toFixed(2)
      : displayPrice;

  const handleBilling = () => {
    console.log("plan", plan);
    console.log("billing", billing);
    console.log("payment gateway");

    // step 1
    // create a checkout page - it will first update the subscription schema then call the payu test url with the available data required
  };

  return (
    <Card className="flex flex-col justify-between shadow-md rounded-2xl border p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md h-full mx-auto">
      <CardContent className="p-0 flex flex-col gap-6 flex-grow">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xl sm:text-2xl font-bold">{plan.name}</h3>
            {billing === "yearly" && plan.savings && (
              <span className="text-[10px] sm:text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                Save {plan.savings}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div>
            <div className="text-2xl sm:text-3xl font-bold">
              ${monthlyPrice}
              <span className="text-sm sm:text-base font-medium text-muted-foreground">
                /month
              </span>
            </div>
            {billing === "yearly" ? (
              <p className="text-xs sm:text-sm text-muted-foreground">
                ${displayPrice}
                <span className="ml-1">/year</span>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Billed Monthly
              </p>
            )}
          </div>

          {/* Promo Section */}
          <div className="flex flex-col gap-2">
            <Button
              className="w-full text-xs sm:text-sm rounded-2xl px-4 py-2"
              onClick={handleBilling}
            >
              Promo: ONLY $1 For 7 Days
            </Button>
            <a
              href="#"
              className="text-[11px] sm:text-xs text-center text-blue-600 hover:underline"
              onClick={handleBilling}
            >
              or skip trial and pay now
            </a>
          </div>
        </div>

        {/* Prompts per month */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            {plan.prompts} Prompts per month
          </h4>
          <div className="space-y-1">
            {plan.prompt_features.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {item.includes ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={
                    item.includes
                      ? "text-sm"
                      : "line-through text-muted-foreground text-sm"
                  }
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategies */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            Trading Strategies
          </h4>
          <div className="space-y-1">
            {plan.strategies.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {item.includes ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={
                    item.includes
                      ? "text-sm"
                      : "line-through text-muted-foreground text-sm"
                  }
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Tools */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            Premium Tools
          </h4>
          <div className="space-y-1">
            {plan.features.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {item.includes ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={
                    item.includes
                      ? "text-sm"
                      : "line-through text-muted-foreground text-sm"
                  }
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
