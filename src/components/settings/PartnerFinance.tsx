import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function PartnerFinance() {
  const handleSubmit = () => {
    console.log("Form");
  };
  const handleCSV = () => {
    console.log("Handle CSV");
  };
  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-6 space-y-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Finance
        </h3>
        <p className="leading-7 [&:not(:first-child)]:mt-0">
          Payment statistics
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
            <TableCaption>
              All refunds and Chargebacks are being deducted from the affiliate
              commission.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Lifetime Earnings</TableHead>
                <TableHead className="text-center">Locking</TableHead>
                <TableHead className="text-center">Reviewing</TableHead>
                <TableHead className="text-center">Withdrawable</TableHead>
                <TableHead className="text-center">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-center">
                  $ 0.00
                </TableCell>
                <TableCell className="text-center">$ 0</TableCell>
                <TableCell className="text-center">$ 0</TableCell>
                <TableCell className="text-center">$ 0</TableCell>
                <TableCell className="text-center">$ 0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-8">
          <Button className="rounded-4xl cursor-pointer" onClick={handleCSV}>
            Export more details to csv
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
