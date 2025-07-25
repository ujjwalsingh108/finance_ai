import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FeedbackForm() {
  const [email, setEmail] = useState("");
  const [type] = useState("");
  const [detail, setDetail] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files).slice(0, 6);
    setFiles(selectedFiles);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Submit logic here
    console.log({ email, type, detail, files });
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="px-6 py-3 space-y-6">
        <p className="leading-7 [&:not(:first-child)]:mt-2">
          You can submit any issues you encounter, and we will get back to you
          as soon as possible.
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-between items-center gap-4">
            <Label htmlFor="email" className="text-gray-700">
              Email:
            </Label>
            <Input
              required
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-white text-gray-900 border-gray-300"
            />
          </div>

          <div className="flex justify-between items-center gap-4">
            <Label htmlFor="email" className="text-gray-700">
              Type:
            </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {/* <SelectLabel>Fruits</SelectLabel> */}
                  <SelectItem value="how_to_use">How to use ?</SelectItem>
                  <SelectItem value="functionality_issue">
                    Functionality issue
                  </SelectItem>
                  <SelectItem value="billing">
                    Billing & Subscription issue
                  </SelectItem>
                  <SelectItem value="feature_requests">
                    Feature requests
                  </SelectItem>
                  <SelectItem value="ui_issue">UI issue</SelectItem>
                  <SelectItem value="product_unresponsive">
                    Product unresponsive
                  </SelectItem>
                  <SelectItem value="business_cooperation">
                    Business cooperation
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-start gap-4">
            <Label htmlFor="description" className="text-gray-700">
              Detail:
            </Label>
            <Textarea
              id="description"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Please describe the issue in detail so we can get back to you with solutions as soon as possible"
              className="bg-white text-gray-900 border-gray-300 min-h-[120px]"
            />
          </div>

          <div className="space-y-4 flex flex-col">
            <Label htmlFor="screenshot" className="text-gray-700">
              Attach screenshots/images (up to 6)
            </Label>
            <Input
              id="screenshot"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="bg-white text-gray-900 border-gray-300 file:text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" className="cursor-pointer">
              Feedback History
            </Button>
            <Button
              type="submit"
              className="text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Submit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
