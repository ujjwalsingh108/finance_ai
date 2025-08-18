"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/settings/AccountCard";
import { BillingSection } from "@/components/settings/BillingSection";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";
import { Support } from "@/components/settings/Support";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reward } from "@/components/settings/Reward";

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
      case "Support":
        return <Support />;
      case "Rewards Program":
        return <Reward />;
      default:
        return <AccountCard />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left section: Back + Title */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="size-5" />
            <span className="sr-only">Back to Home</span>
          </Button>
          <h3 className="text-2xl font-semibold tracking-tight">My Account</h3>
        </div>

        {/* Tabs: responsive scrollable */}
        <div className="overflow-x-auto w-full md:w-auto">
          <div className="grid md:grid-cols-5 grid-col-1 gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "secondary"}
                onClick={() => setActiveTab(tab)}
                className="text-sm whitespace-nowrap cursor-pointer"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t" />

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}
