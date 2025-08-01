import { Card, CardContent } from "@/components/ui/card";
import { Atom } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PartnerCreatives() {
  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-4 space-y-2">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Download banners
        </h3>
        <p className="leading-7 [&:not(:first-child)]:mt-0">
          Enhance your conversion rate by promoting Intellectia with official,
          high-quality brand assets.
        </p>
      </CardContent>
      <div className="grid grid-cols-2 px-4 gap-2">
        <Card className="flex flex-row justify-start items-center p-4 gap-2 hover:bg-gray-100 cursor-pointer">
          <Atom />
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Basic light
          </h3>
        </Card>
        <Card className="flex flex-row justify-start items-center p-4 gap-2 hover:bg-gray-100 cursor-pointer">
          <Atom />
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Basic dark
          </h3>
        </Card>
        <Card className="flex flex-row justify-start items-center p-4 gap-2 hover:bg-gray-100 cursor-pointer">
          <Atom />
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Basic color
          </h3>
        </Card>
      </div>
      <div className="px-4">
        <Button className="rounded-4xl cursor-pointer">Download All</Button>
      </div>
    </Card>
  );
}
