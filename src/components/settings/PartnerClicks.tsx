import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PartnerClicks() {
  const handleSubmit = () => {
    console.log("Form");
  };

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-6 space-y-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Clicks
        </h3>
        <p className="leading-7 [&:not(:first-child)]:mt-0">
          Use this section to check the clicks to your affiliate links.
        </p>
        <form className="space-y-2" onSubmit={handleSubmit}>
          <div>
            <Select>
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>All time</SelectLabel>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last_7_days">Last 7 days</SelectItem>
                  <SelectItem value="month_to_date">Month to date</SelectItem>
                  <SelectItem value="last_month">Last month</SelectItem>
                  <SelectItem value="last_6_months">Last 6 months</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </form>
        <div className="flex justify-between">
          <div className="grid grid-rows-2">
            <p className="font-medium leading-7 [&:not(:first-child)]:mt-0">
              Link
            </p>
            <p className="text-zinc-700 leading-7 [&:not(:first-child)]:mt-0">
              Total All Landings/Links
            </p>
          </div>
          <div className="grid grid-rows-2">
            <p className="font-medium leading-7 [&:not(:first-child)]:mt-0">
              Clicks
            </p>
            <p className="text-zinc-700 leading-7 [&:not(:first-child)]:mt-0">
              0
            </p>
          </div>
        </div>
        {/* Divider */}
        <div className="my-6 border-t" />
        <div className="space-y-1">
          <p className="text-gray-700 leading-7 [&:not(:first-child)]:mt-0 text-sm">
            Please note that the above click data is approximate. To track the
            exact number of clicks, please use your own click tracker.
          </p>
          <p className="text-gray-700 leading-7 [&:not(:first-child)]:mt-0 text-sm">
            Your affiliate commission isn&apos;t related to the number of clicks
            to your affiliate links. We compensate for paid conversions only
            (CPS) and not for any clicks (CPC).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
