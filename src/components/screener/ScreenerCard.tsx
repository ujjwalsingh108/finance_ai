import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ScreenerCard({
  label,
  symbols,
  tags = [],
  change,
  image,
}: {
  label: string;
  symbols: number;
  tags?: string[];
  change?: string;
  image?: string;
}) {
  return (
    <Card className="relative h-48 overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
      <div className="relative z-10 h-full w-full p-4 text-white flex flex-col justify-between">
        <div className="flex gap-2">
          {tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant={tag === "Bullish" ? "default" : "destructive"}
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div>
          <h3 className="font-semibold text-base">{label}</h3>
          <p className="text-xs text-muted">{symbols} symbols</p>
          {change && (
            <p className="text-green-400 font-medium text-sm">{change}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
