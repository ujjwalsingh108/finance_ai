// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// PayU credentials
const MERCHANT_KEY = process.env.PAYU_KEY!;
const MERCHANT_SALT = process.env.PAYU_SALT_32BIT!;
const PAYU_BASE_URL = process.env.PAYU_TEST_URL!; // change to live in prod

// Supabase service client (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { planId, orgId } = await req.json();

    if (!planId || !orgId) {
      return NextResponse.json(
        { error: "planId and orgId are required" },
        { status: 400 }
      );
    }

    // 1. Get plan details
    const { data: plan, error: planError } = await supabase
      .from("billing_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      console.error("Plan fetch error:", planError);
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // 2. Insert subscription record
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert([
        {
          organization_id: orgId,
          plan_id: planId,
          status: "pending",
        },
      ])
      .select("id")
      .single();

    if (subError || !subscription) {
      console.error("Subscription insert error:", subError);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    // 3. Prepare PayU request
    const txnid = subscription.id; // uuid from DB
    const amount = (plan.price_cents / 100).toFixed(2);
    const productinfo = plan.name;
    const firstname = "TestUser"; // TODO: replace with logged-in user details
    const email = "test@example.com"; // TODO: replace with logged-in user email

    // PayU hash format:
    // sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
    const hashString = `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${MERCHANT_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // 4. Return PayU form details
    return NextResponse.json({
      action: PAYU_BASE_URL,
      params: {
        key: MERCHANT_KEY,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone: "9999999999",
        surl: `${process.env.BASE_URL}/api/payu-webhook`, // success
        furl: `${process.env.BASE_URL}/api/payu-webhook`, // failure
        hash,
      },
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
