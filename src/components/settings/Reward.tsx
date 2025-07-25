"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartnerProgramTabs } from "./PartnerProgramTabs";
import { Card, CardContent } from "@/components/ui/card";

export function Reward() {
  return (
    <div className="px-2 md:px-4 lg:px-6">
      <Tabs defaultValue="partner-program" className="w-full">
        <div className="overflow-x-auto whitespace-nowrap mb-2 scrollbar-hide">
          <TabsList className="flex w-max gap-2">
            <TabsTrigger value="partner-program" className="cursor-pointer">
              Partner Program
            </TabsTrigger>
            <TabsTrigger value="refer-and-earn" className="cursor-pointer">
              Refer and Earn
            </TabsTrigger>
            <TabsTrigger value="user-survey" className="cursor-pointer">
              User Survey
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="border-t mb-2" />

        <TabsContent value="partner-program" className="w-full">
          <Card>
            <CardContent className="px-4 py-4 md:px-6 space-y-6">
              <PartnerProgramTabs />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refer-and-earn">
          Refer & Earn content coming soon.
        </TabsContent>
        <TabsContent value="user-survey">
          User Survey content coming soon.
        </TabsContent>
      </Tabs>
    </div>
  );
}
