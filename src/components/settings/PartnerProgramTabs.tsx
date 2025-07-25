import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartnerLink } from "./PartnerLink";

export function PartnerProgramTabs() {
  return (
    <Tabs defaultValue="links" className="w-full">
      <div className="overflow-x-auto whitespace-nowrap scrollbar-hide mb-4">
        <TabsList className="flex w-max gap-2">
          <TabsTrigger value="links" className="cursor-pointer">
            Links
          </TabsTrigger>
          <TabsTrigger value="clicks" className="cursor-pointer">
            Clicks
          </TabsTrigger>
          <TabsTrigger value="report" className="cursor-pointer">
            Report
          </TabsTrigger>
          <TabsTrigger value="finance" className="cursor-pointer">
            Finance
          </TabsTrigger>
          <TabsTrigger value="creatives" className="cursor-pointer">
            Creatives
          </TabsTrigger>
          <TabsTrigger value="faq" className="cursor-pointer">
            FAQ
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="links">
        <PartnerLink />
      </TabsContent>
      <TabsContent value="clicks">Clicks content coming soon.</TabsContent>
      <TabsContent value="report">Report content coming soon.</TabsContent>
      <TabsContent value="finance">Finance content coming soon.</TabsContent>
      <TabsContent value="creatives">
        Creatives content coming soon.
      </TabsContent>
      <TabsContent value="faq">FAQ content coming soon.</TabsContent>
    </Tabs>
  );
}
