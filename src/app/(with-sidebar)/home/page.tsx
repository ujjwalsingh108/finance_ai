import { IndexChartsGridLive } from "@/components/home/IndexChartsGridLive";
import Intro from "@/components/home/Intro";
import { SectionCards } from "@/components/home/SectionCards";
import { ChartAreaInteractive } from "@/components/home/chart-area-interactive";
import React from "react";

export default function Home() {
  return (
    <div>
      <Intro />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 mb-[-10px] lg:px-6 font-semibold">
              <h5 className="text-lg">Trading Strategies</h5>
            </div>
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
              <SectionCards
                description="AI-selected top daily stocks to day trade"
                title="STOCKS"
                tag="AI Stock Picker"
              />
              <SectionCards
                description="Trade like a pro simply by following AI-guided signals"
                title="STOCKS"
                tag="SwingMax"
              />
              <SectionCards
                description="Real-time market tracker for fast-paced day trading decisions"
                title="STOCKS"
                tag="Daytrading Signal"
              />
              <SectionCards
                description="Spot Winning Crpto Trades Instantly with AI-powered scanner"
                title="CRYPTOS"
                tag="Crypto Radar"
              />
            </div>
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <div className="px-4 lg:px-6">
              {/* <IndexChartsGrid /> */}
              <IndexChartsGridLive />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
