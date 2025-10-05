import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TokenUsageCardProps {
  tokensUsed: number;
  tokensLimit: number;
}

export const TokenUsageCard: React.FC<TokenUsageCardProps> = ({
  tokensUsed,
  tokensLimit,
}) => {
  const tokensLeft = tokensLimit - tokensUsed;
  const percentUsed = Math.min((tokensUsed / tokensLimit) * 100, 100);

  return (
    <Card className="@container/card relative overflow-hidden transition-all duration-500 shadow-lg hover:scale-[1.03] cursor-pointer dark:bg-transparent">
      <CardHeader>
        <CardTitle className="text-lg font-bold">OpenAI Token Usage</CardTitle>
        <CardDescription className="text-sm">
          Track your token consumption and remaining quota.
        </CardDescription>
      </CardHeader>
      <div className="px-4 py-2 flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Consumed:</span>
          <span className="text-blue-600">{tokensUsed.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Remaining:</span>
          <span className="text-green-600">{tokensLeft.toLocaleString()}</span>
        </div>
        <Progress value={percentUsed} />
      </div>
      <CardFooter className="text-xs text-gray-500 px-4 pb-2">
        Limit: {tokensLimit.toLocaleString()} tokens
      </CardFooter>
    </Card>
  );
};

export default TokenUsageCard;
