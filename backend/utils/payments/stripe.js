import Stripe from "stripe";

const hasStripeConfig = () => !!process.env.STRIPE_SECRET_KEY;

let stripe = null;
const getStripe = () => {
  if (!hasStripeConfig()) return null;
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
};

// Creates a Stripe-hosted Checkout Session for a single order, priced in
// PKR. Stripe expects the amount in the currency's smallest unit; PKR is
// a standard 2-decimal currency on Stripe (unlike JPY/KRW etc.), so the
// rupee amount is multiplied by 100 to get paisas.
//
// IMPORTANT: Stripe does not currently support Pakistan as a merchant's
// business/payout country. This integration only works if the store's
// Stripe account is registered in a country Stripe does support (e.g. UAE,
// UK, US) and that account has PKR enabled as a presentment currency —
// confirm this with Stripe support before relying on it in production.
export const createStripeCheckoutSession = async (order, { successUrl, cancelUrl }) => {
  const s = getStripe();
  if (!s) throw new Error("Stripe is not configured on this server");
  const session = await s.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "pkr",
        unit_amount: Math.round(order.totalAmount * 100),
        product_data: { name: `Al-Hussaini Garments — Order ${order.orderId}` }
      },
      quantity: 1
    }],
    customer_email: order.email || undefined,
    metadata: { orderId: String(order._id), orderNumber: order.orderId },
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return session;
};

export const constructStripeWebhookEvent = (rawBody, signature) => {
  const s = getStripe();
  if (!s) throw new Error("Stripe is not configured on this server");
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return s.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

export const isStripeEnabled = hasStripeConfig;
