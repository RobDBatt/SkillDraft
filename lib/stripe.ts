import Stripe from "stripe";

// Lazily instantiated via a Proxy: the Stripe client is built on first property
// access, not at module load. This keeps `next build` (page-data collection)
// from crashing when STRIPE_SECRET_KEY is absent — e.g. local builds without
// production secrets. Only routes that actually call Stripe will throw, and
// only if the key is genuinely missing at runtime.
let client: Stripe | null = null;

function getStripe(): Stripe {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("stripe: STRIPE_SECRET_KEY must be set");
  }

  client = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return client;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const c = getStripe();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});

// ── Credit pack definitions ───────────────────────────────────────────────────
// lookup_key is used to create/find prices idempotently in Stripe.
// Changing a pack changes the key (append _v2, etc.) to avoid reusing old prices.

export const PACKS = {
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
