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
  const displayPrice = billing === "yearly" ? plan.price : plan.oldPrice;
  const displayNote =
    billing === "yearly"
      ? `$${plan.yearly}/Year`
      : `${plan.prompts} Prompts / Month`;

  return (
    <Card className="flex flex-col justify-between shadow-md rounded-2xl border p-4 sm:p-4 w-full max-w-md h-full">
      <CardContent className="p-0 flex flex-col gap-4 flex-grow">
        {/* Header */}
        <div className="flex flex-col h-full justify-between gap-2">
          {/* Header */}
          <div className="min-h-[40px] flex justify-between items-center">
            <h3 className="text-2xl font-bold">{plan.tier}</h3>
            {billing === "yearly" && plan.savings && (
              <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                Save {plan.savings}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="min-h-[40px]">
            <div className="text-3xl font-bold">
              ${displayPrice}
              <span className="text-base font-medium text-muted-foreground">
                /month
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{displayNote}</p>
          </div>

          {/* Promo Section */}
          <div className="space-y-2 min-h-[40px] flex flex-col justify-center">
            <Button className="w-full text-xs sm:text-sm rounded-2xl px-4 py-2">
              Promo: ONLY $1 For 7 Days
            </Button>

            <a
              href="#"
              className="text-xs text-center text-blue-600 hover:underline block"
            >
              or skip trial and pay now
            </a>
          </div>
        </div>

        {/* Prompts per month */}
        <div className="text-sm space-y-1 pt-2">
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            {plan.prompts} Prompts per month
          </h4>
          {plan.prompt_features.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.includes ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span
                className={
                  item.includes ? "" : "line-through text-muted-foreground"
                }
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* Strategies */}
        <div className="text-sm space-y-1 pt-2">
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            Trading Strategies
          </h4>
          {plan.strategies.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.includes ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span
                className={
                  item.includes ? "" : "line-through text-muted-foreground"
                }
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* Premium Tools */}
        <div className="text-sm space-y-1 pt-2">
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">
            Premium Tools
          </h4>
          {plan.features.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.includes ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span
                className={
                  item.includes ? "" : "line-through text-muted-foreground"
                }
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
