import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartnerLink } from "./PartnerLink";
import { PartnerClicks } from "./PartnerClicks";
import { PartnerReport } from "./PartnerReport";
import { PartnerFinance } from "./PartnerFinance";
import { PartnerCreatives } from "./PartnerCreatives";
import { PartnerFaq } from "./PartnerFaq";

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
      <TabsContent value="clicks">
        <PartnerClicks />
      </TabsContent>
      <TabsContent value="report">
        <PartnerReport />
      </TabsContent>
      <TabsContent value="finance">
        <PartnerFinance />
      </TabsContent>
      <TabsContent value="creatives">
        <PartnerCreatives />
      </TabsContent>
      <TabsContent value="faq">
        <PartnerFaq />
      </TabsContent>
    </Tabs>
  );
}
