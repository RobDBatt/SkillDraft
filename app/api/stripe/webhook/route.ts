import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  switch (event.type) {
    // ── Credit pack or new subscription checkout completed ───────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") break;

      const userId  = session.metadata?.user_id;
      const credits = parseInt(session.metadata?.credits ?? "0", 10);

      if (userId && credits > 0) {
        await supabaseAdmin.rpc("add_credits", {
          p_user_id: userId,
          p_amount:  credits,
        });
      }

      // Persist subscription ID for Pro
      if (session.mode === "subscription" && session.subscription && userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            stripe_subscription_id: String(session.subscription),
            subscription_status:    "active",
          })
          .eq("id", userId);
      }
      break;
    }

    // ── Monthly subscription renewal → top up 50 credits ────────────────────
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & {
        billing_reason?: string;
        subscription?: string | null;
      };
      // Skip the very first invoice — covered by checkout.session.completed above
      if (invoice.billing_reason === "subscription_create") break;

      if (!invoice.subscription) break;
      const sub = await stripe.subscriptions.retrieve(String(invoice.subscription));
      const userId = sub.metadata?.user_id;
      if (userId) {
        await supabaseAdmin.rpc("add_credits", {
          p_user_id: userId,
          p_amount:  50,
        });
      }
      break;
    }

    // ── Subscription cancelled ───────────────────────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status:    "canceled",
            stripe_subscription_id: null,
          })
          .eq("id", userId);
      }
      break;
    }

    // ── Subscription payment failed ──────────────────────────────────────────
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (userId && sub.status === "past_due") {
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
