import Order from "../models/Order.js";
import { createStripeCheckoutSession, constructStripeWebhookEvent, isStripeEnabled } from "../utils/payments/stripe.js";
import { buildJazzCashCheckoutFields, verifyJazzCashResponse, isJazzCashEnabled } from "../utils/payments/jazzcash.js";
import { sendPaymentConfirmedEmail } from "../utils/email.js";

const clientBase = () => (process.env.CLIENT_URL || "").split(",")[0] || "";
const apiBase = () => (process.env.API_URL || "").split(",")[0] || "";

// Tells the frontend which gateways are actually usable right now, so the
// Checkout page can show/hide payment options instead of offering a
// payment method that isn't configured yet.
export const getPaymentConfig = (req, res) => {
  res.json({ stripeEnabled: isStripeEnabled(), jazzCashEnabled: isJazzCashEnabled() });
};

// -------------------- STRIPE --------------------

export const createStripeSession = async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.paymentStatus === "Paid") return res.status(400).json({ message: "This order is already paid" });
  try {
    const session = await createStripeCheckoutSession(order, {
      successUrl: `${clientBase()}/payment/success?order=${order.orderId}`,
      cancelUrl: `${clientBase()}/payment/cancel?order=${order.orderId}`
    });
    order.paymentGatewayRef = session.id;
    await order.save();
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to start card payment" });
  }
};

// Mounted with express.raw() so req.body is a Buffer here, required for
// Stripe's signature verification.
export const stripeWebhook = async (req, res) => {
  let event;
  try {
    event = constructStripeWebhookEvent(req.body, req.headers["stripe-signature"]);
  } catch (error) {
    return res.status(400).send(`Webhook signature verification failed: ${error.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== "Paid") {
        order.paymentStatus = "Paid";
        order.paymentGatewayResponse = { id: session.id, payment_status: session.payment_status };
        order.timeline.push({ status: order.status, note: "Payment confirmed via Stripe" });
        await order.save();
        sendPaymentConfirmedEmail(order).catch(() => {});
      }
    }
  }
  res.json({ received: true });
};

// -------------------- JAZZCASH --------------------

// Returns a tiny self-submitting HTML page that POSTs the customer straight
// to JazzCash's hosted checkout — this is how JazzCash's Web Checkout flow
// works (no JSON API for the payment page itself).
export const jazzCashInitiate = async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).send("Order not found");
  if (order.paymentStatus === "Paid") return res.status(400).send("This order is already paid");
  try {
    const returnUrl = `${apiBase()}/api/payments/jazzcash/callback`;
    const fields = buildJazzCashCheckoutFields(order, returnUrl);
    const { gatewayUrl, ...formFields } = fields;
    order.paymentGatewayRef = fields.pp_TxnRefNo;
    await order.save();
    const inputs = Object.entries(formFields).map(([k, v]) => `<input type="hidden" name="${k}" value="${v}"/>`).join("");
    res.send(`<!DOCTYPE html><html><body onload="document.forms[0].submit()">
      <p>Redirecting to JazzCash...</p>
      <form method="POST" action="${gatewayUrl}">${inputs}</form>
    </body></html>`);
  } catch (error) {
    res.status(500).send(error.message || "Unable to start JazzCash payment");
  }
};

// JazzCash POSTs the result back to this URL. We verify the hash, update
// the order, then redirect the customer's browser to the frontend.
export const jazzCashCallback = async (req, res) => {
  const { valid, success } = verifyJazzCashResponse(req.body || {});
  const ref = req.body?.pp_TxnRefNo;
  const order = ref ? await Order.findOne({ paymentGatewayRef: ref }) : null;

  if (order && valid) {
    order.paymentGatewayResponse = req.body;
    if (success && order.paymentStatus !== "Paid") {
      order.paymentStatus = "Paid";
      order.timeline.push({ status: order.status, note: "Payment confirmed via JazzCash" });
      await order.save();
      sendPaymentConfirmedEmail(order).catch(() => {});
    } else if (!success) {
      order.paymentStatus = "Failed";
      await order.save();
    }
  }

  const orderNumber = order?.orderId || "";
  res.redirect(`${clientBase()}/payment/${success ? "success" : "cancel"}?order=${orderNumber}`);
};
