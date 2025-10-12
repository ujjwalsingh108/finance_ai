import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyIcon, Mail, Facebook, X } from "lucide-react";

export function PartnerLink() {
  const handleSubmit = () => {
    console.log("Form");
  };

  const handleCopy = () => {
    console.log("Copy");
  };

  return (
    <Card className="border bg-background shadow-sm">
      <CardContent className="p-6 space-y-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Link Builder
        </h3>
        <p className="leading-7 [&:not(:first-child)]:mt-0">
          You can use this Link builder to generate your custom affiliate link.
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="link">Target link*</Label>
              <Input placeholder="https://aigoat.in" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="link">Affiliate ID*</Label>
              <Input placeholder="affiliation-sA6uEHzdEGx0Jslq7qvQ" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="link">Aff Sub</Label>
              <Input />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="link">Source</Label>
              <Input />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="link">Final link</Label>
              <div className="flex justify-between items-center gap-2">
                <Input placeholder="https://intellectia.ai/?aff_id=affiliation-sA6uEHzdEGx0Jslq7qvQ" />
                <CopyIcon
                  className="w-4 h-4 cursor-pointer"
                  onClick={handleCopy}
                />
              </div>
            </div>
          </div>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 cursor-pointer"
          >
            <Mail className="text-teal-400" />
            Email
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 cursor-pointer"
          >
            <Facebook className="text-blue-600" />
            Facebook
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 cursor-pointer"
          >
            <X />X
          </Button>
        </div>
        <div className="space-y-2">
          <p className="font-medium leading-7 [&:not(:first-child)]:mt-2">
            Here are some guidelines to follow:
          </p>
          <ul className="list-disc pl-4 space-y-2 text-gray-500">
            <li>
              <p className="leading-7">
                Avoid purchasing an Intellectia subscription through your own
                referral link.
              </p>
            </li>
            <li>
              <p className="leading-7">
                Refrain from running advertising campaigns that include
                Intellectia brand keywords, variations, or misspellings.
              </p>
            </li>
            <li>
              <p className="leading-7">
                Never use fraudulent tactics such as fake traffic, malware,
                adware, or stolen data.
              </p>
            </li>
            <li>
              <p className="leading-7">
                Do not engage in spam activities, such as sending unsolicited
                emails to a wide audience.
              </p>
            </li>
            <li>
              <p className="leading-7">
                Do not promote false Intellectia discounts or create discounts
                that do not exist.
              </p>
            </li>
            <li>
              <p className="leading-7">
                Do not make false promises or marketing campaigns about the
                partner program.
              </p>
            </li>
          </ul>
          <small className="text-sm leading-none font-medium text-gray-500">
            To ensure we&apos;re working well together, read our{" "}
            <span className="text-teal-400">Partner Program rules.</span>
          </small>
        </div>
      </CardContent>
    </Card>
  );
}
