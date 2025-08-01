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
import { Input } from "@/components/ui/input";
import { CircleCheck } from "lucide-react";
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
        <div>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Payment rules
          </h4>
          <ul className="my-3 ml-6 list-disc [&>li]:mt-2">
            <li>
              Commissions can be withdrawn once your balance meets the
              withdrawal threshold.
            </li>
            <li>
              Payout requests will be processed within five business days from
              the date of the withdrawal request.
            </li>
            <li>Payments are made via PayPal.</li>
            <li>
              To ensure we&apos;re working well together, read our{" "}
              <span className="text-teal-400">Partner Program rules.</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Payouts
          </h4>
          <p className="leading-7 my-3">
            <span className="font-semibold">Please note:</span> The minimum
            withdrawal amount is $60. Transfers may incur handling/tax fees,
            which are the responsibility of the user. By proceeding with a
            transfer, you acknowledge and agree to bear any applicable handling
            fees associated with the transaction.
          </p>
        </div>
        <div className="gap-2">
          <div className="w-1/2 flex flex-row gap-2">
            <Input type="text" placeholder="Enter your paypal address" />
            <Button className="cursor-pointer">Submit</Button>
          </div>
          <div className="flex flex-row items-center gap-2 text-gray-700">
            <CircleCheck className="w-4" />
            <p className="leading-7">PayPal Address</p>
          </div>
        </div>
        <div className="gap-2">
          <div className="w-1/2 flex flex-col gap-2">
            <Input type="file" placeholder="Upload your signed IRS form" />
          </div>
          <div className="flex flex-row items-center gap-2 text-gray-700">
            <CircleCheck className="w-4" />
            <p className="leading-7">
              Download <span className="text-teal-400">IRS form</span>, sign it,
              scan it, and attach. For Non-US. Affiliates, download{" "}
              <span className="text-teal-400">Here.</span>
            </p>
          </div>
        </div>
        <div className="my-6">
          <Button className="rounded-4xl cursor-pointer" onClick={handleCSV}>
            Withdraw
          </Button>
        </div>
        <div className="my-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Withdrawal Amount</TableHead>
                <TableHead className="text-center">Payout status</TableHead>
                <TableHead className="text-center">Approved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* <TableRow>
                <TableCell className="font-medium text-center">0</TableCell>
                <TableCell className="text-center">0</TableCell>
                <TableCell className="text-center">0</TableCell>
              </TableRow> */}
            </TableBody>
          </Table>
        </div>
        <div>
          <p className="leading-7 [&:not(:first-child)]:mt-0">
            <span className="font-semibold">
              Tax Form Completion Disclaimer: &nbsp;
            </span>
            The information provided in this document is for general
            informational purposes only. It is not intended to be, and should
            not be considered, legal, tax, or financial advice. Intellectia and
            its representatives are not responsible for ensuring that the
            information provided in your tax form is accurate, complete, or
            timely.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
