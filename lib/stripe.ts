import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

// ── Credit pack definitions ───────────────────────────────────────────────────
// lookup_key is used to create/find prices idempotently in Stripe.
// Changing a pack changes the key (append _v2, etc.) to avoid reusing old prices.

export const PACKS = {
  starter: {
    credits: 20,
    amount:  400,   // cents
    label:   "Starter",
    lookupKey: "sd_starter_v1",
  },
  standard: {
    credits: 75,
    amount:  1200,
    label:   "Standard",
    lookupKey: "sd_standard_v1",
    popular: true,
  },
  power: {
    credits: 200,
    amount:  2500,
    label:   "Power",
    lookupKey: "sd_power_v1",
  },
} as const;

export const PRO = {
  credits:   50,
  amount:    500,
  lookupKey: "sd_pro_monthly_v1",
};

export type PackKey = keyof typeof PACKS;

// ── Idempotent price lookup / creation ────────────────────────────────────────
export async function getOrCreatePrice(
  lookupKey: string,
  productName: string,
  amount: number,
  recurring = false
): Promise<Stripe.Price> {
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey] });
  if (existing.data.length > 0) return existing.data[0];

  const product = await stripe.products.create({ name: productName });
  return stripe.prices.create({
    product:    product.id,
    unit_amount: amount,
    currency:   "usd",
    lookup_key: lookupKey,
    ...(recurring ? { recurring: { interval: "month" } } : {}),
  });
}
