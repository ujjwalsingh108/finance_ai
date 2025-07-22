"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { UsageCard } from "./UsageCard";
import { BillingCard } from "./BillingCard";

export function BillingSection() {
  return (
    <Tabs defaultValue="billing" className="w-full mx-auto">
      <TabsList className="w-full flex justify-start">
        <TabsTrigger className="cursor-pointer" value="billing">
          Billing
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="usage">
          Usage
        </TabsTrigger>
      </TabsList>

      <TabsContent value="billing">
        <BillingCard />
      </TabsContent>

      <TabsContent value="usage">
        <UsageCard />
      </TabsContent>
    </Tabs>
  );
}
