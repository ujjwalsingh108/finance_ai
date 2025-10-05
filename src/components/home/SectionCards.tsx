import Image from "next/image";

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
    <Card className="@container/card relative overflow-hidden transition-all duration-500 shadow-lg hover:scale-[1.03] cursor-pointer bg-[linear-gradient(135deg,_#e0e7ff_0%,_#f0fdfa_60%,_#f5d0fe_100%)] dark:bg-transparent">
      <div className="absolute top-0 right-0 bottom-0 w-1/3 h-full z-0">
        <Image
          src="/images/stock.jpg"
          alt="Stock Icon"
          fill
          className="object-cover object-right opacity-70 transition-opacity duration-500 group-hover:opacity-90"
          priority
        />
      </div>
      <div className="grid grid-cols-1 gap-4 p-2 relative z-10">
        <CardHeader>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent transition-all duration-500">
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
