"use client";
import { ScreenerCard } from "./ScreenerCard";

export function AIScreenerSection({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    symbols: number;
    tags?: string[];
    change?: string;
  }[];
}) {
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((item, idx) => (
          <ScreenerCard key={idx} {...item} />
        ))}
      </div>
    </section>
  );
}
