import { TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface SectionCardProps {
  description?: string;
  title?: string;
  tag?: string;
}

export const SectionCards: React.FC<SectionCardProps> = ({
  description,
  title,
  tag,
}) => {
  return (
    <Card className="@container/card relative overflow-hidden">
      <div className="absolute top-0 right-0 bottom-0 w-1/3 h-full z-0">
        <Image
          src="/images/stock.jpg"
          alt="Stock Icon"
          fill
          className="object-cover object-right"
          priority
        />
      </div>
      <div className="grid grid-cols-1 gap-4 p-2 relative z-10">
        <CardHeader>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {tag}
          </CardTitle>
          <CardAction className="flex items-center gap-2">
            {/* You can add more content here if needed */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium w-[65%]">
            {description}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};
