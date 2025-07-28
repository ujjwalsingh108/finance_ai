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
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function PartnerReport() {
  const handleSubmit = () => {
    console.log("Form");
  };
  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-6 space-y-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Reports
        </h3>
        <p className="leading-7 [&:not(:first-child)]:mt-0">
          Use this section to generate detailed traffic reports.
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
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Total Purchases</TableHead>
                <TableHead className="text-center">Signups</TableHead>
                <TableHead className="text-center">Trials</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-center">0</TableCell>
                <TableCell className="text-center">0</TableCell>
                <TableCell className="text-center">0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div>
          <Table>
            {/* <TableCaption>A list of your recent reports.</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">
                  Affiliate Commission
                </TableHead>
                <TableHead className="text-center">Refund</TableHead>
                <TableHead className="text-center">Chargeback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-center">$0.00</TableCell>
                <TableCell className="text-center">0</TableCell>
                <TableCell className="text-center">0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div>
          <RadioGroup defaultValue="comfortable">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="default" id="r1" />
              <div className="flex flex-col gap-2">
                <Label htmlFor="r1" className="font-bold">
                  Overview report
                </Label>
                <small className="text-sm leading-none">
                  Signups, Trials, Purchases, Refund, Chargeback, Commission
                </small>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RadioGroupItem value="comfortable" id="r2" />
              <div className="flex flex-col gap-2">
                <Label htmlFor="r2" className="font-bold">
                  Conversion report
                </Label>
                <small className="text-sm leading-none">
                  Date & Time, Conversion Event, Payout, Transaction lD, Source,
                  Aff.sub
                </small>
              </div>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
