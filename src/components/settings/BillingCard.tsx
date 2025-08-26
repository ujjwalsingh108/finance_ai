"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

type BillingInfo = {
  email: string;
  orgName: string;
  planName: string;
  currency: string;
  price: number;
  startedAt?: string;
  endedAt?: string;
  hasSubscription: boolean; // ✅ added this
};

export function BillingCard() {
  const supabase = createClient();
  const [billing, setBilling] = useState<BillingInfo | null>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, id")
        .eq("id", user.id)
        .single();

      // 2. Get organization membership
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id, organizations(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership?.organization_id) return;

      console.log("membership", membership);

      // 3. Get subscription + plan
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select(
          `
          id, status, started_at, ended_at,
          billing_plans(name, price_cents, currency)
        `
        )
        .eq("organization_id", membership.organization_id)
        .maybeSingle();

      if (!subscription) {
        // fallback if no subscription exists
        setBilling({
          email: profile?.email || user.email || "-",
          orgName: membership.organizations?.[0]?.name || "Unknown Org", // ✅ fixed
          planName: "Free Plan",
          currency: "USD",
          price: 0,
          hasSubscription: false,
        });
        return;
      }

      const plan = subscription.billing_plans?.[0]; // ✅ fixed

      setBilling({
        email: profile?.email || user.email || "-",
        orgName: membership.organizations?.[0]?.name || "Unknown Org",
        planName: plan?.name || "Free Plan",
        currency: plan?.currency || "USD",
        price: plan?.price_cents || 0,
        startedAt: subscription.started_at || undefined,
        endedAt: subscription.ended_at || undefined,
        hasSubscription: true,
      });
    };

    fetchBilling();
  }, [supabase]);

  if (!billing) {
    return (
      <Card className="mt-4 bg-muted/40">
        <CardContent className="p-6">Loading billing info…</CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 bg-muted/40">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Billing Account</span>
          <span className="text-sm">{billing.email}</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">My Plan</span>
          <span className="text-sm">{billing.planName}</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="text-sm">
            {billing.currency} {billing.price / 100}
          </span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Order time</span>
          <span className="text-sm">{billing.startedAt || "-"}</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Plan ends on</span>
          <span className="text-sm">{billing.endedAt || "-"}</span>
        </div>

        {/* Divider */}
        <div className="my-6 border-t" />

        {/* Disclaimer */}
        <div className="text-sm text-muted-foreground mt-6">
          <span className="font-semibold text-foreground">Disclaimer: </span>
          Aigoat does not store your payment credentials. They are encrypted and
          passed to third-party payment vendor through their API that we use to
          process all payments.
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button variant="secondary">Billing history</Button>
          <Button>
            {billing.hasSubscription ? "Change Plan" : "Upgrade Plan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
