"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BillingCard() {
  return (
    <Card className="mt-4 bg-muted/40">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Billing Account</span>
          <span className="text-sm">usingh2051@gmail.com</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">My Plan</span>
          <span className="text-sm">Free</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="text-sm">$0</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Payment Method</span>
          <span className="text-sm">-</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Order time</span>
          <span className="text-sm">-</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Plan ends on</span>
          <span className="text-sm">-</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        {/* Disclaimer */}
        <div className="text-sm text-muted-foreground mt-6">
          <span className="font-semibold text-foreground">Disclaimer: </span>
          Aigoat does not store your payment credentials. They are encrypted and
          passed to third-party payment vendor through their API that we use to
          process all payments. This API allows us to create a protected link to
          the payment method if the card was used to purchase anything on our
          website and the transaction was successful.
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button variant="secondary">Billing history</Button>
          <Button>Change Plan</Button>
        </div>
      </CardContent>
    </Card>
  );
}
