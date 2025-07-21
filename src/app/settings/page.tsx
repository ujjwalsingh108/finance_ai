"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/settings/AccountCard";
import { BillingSection } from "@/components/settings/BillingSection";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const tabs = [
  "Account",
  "Billing",
  "Subscription",
  "Support",
  "Rewards Program",
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Account");
  const router = useRouter();

  const renderTabContent = () => {
    switch (activeTab) {
      case "Account":
        return <AccountCard />;
      case "Billing":
        return <BillingSection />;
      case "Subscription":
        return <SubscriptionSection />;
      default:
        return <AccountCard />;
    }
  };

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Tab Header */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap items-center gap-2 mb-6 md:flex-row">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="size-5" />
              <span className="sr-only">Back to Home</span>
            </Button>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              My Account
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "secondary"}
                onClick={() => setActiveTab(tab)}
                className="text-sm"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </main>
  );
}
