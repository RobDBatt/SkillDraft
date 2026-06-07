import { NextRequest, NextResponse } from "next/server";
import { stripe, PACKS, PRO, getOrCreatePrice, type PackKey } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  // Verify user from Authorization header
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { type: "pack" | "pro"; pack?: PackKey };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { type, pack } = body;

  // Get or create Stripe customer
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://skilldraft.io";

  // ── Pro monthly subscription ─────────────────────────────────────────────────
  if (type === "pro") {
    const price = await getOrCreatePrice(
      PRO.lookupKey,
      "SkillDraft Pro",
      PRO.amount,
      true
    );
    const session = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        "subscription",
      line_items:  [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/pricing?success=true`,
      cancel_url:  `${origin}/pricing`,
      metadata:    { user_id: user.id, credits: String(PRO.credits), type: "pro" },
      subscription_data: { metadata: { user_id: user.id } },
    });
    return NextResponse.json({ url: session.url });
  }

  // ── One-time credit pack ─────────────────────────────────────────────────────
  if (type === "pack" && pack && pack in PACKS) {
    const cfg = PACKS[pack];
    const price = await getOrCreatePrice(
      cfg.lookupKey,
      `SkillDraft ${cfg.label} Credits`,
      cfg.amount
    );
    const session = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        "payment",
      line_items:  [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/pricing?success=true`,
      cancel_url:  `${origin}/pricing`,
      metadata:    { user_id: user.id, credits: String(cfg.credits), type: "pack" },
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: "Invalid request." }, { status: 400 });
}
