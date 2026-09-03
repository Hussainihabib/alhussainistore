import crypto from "crypto";

const isConfigured = () =>
  !!(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD && process.env.JAZZCASH_INTEGRITY_SALT);

const GATEWAY_URL = process.env.JAZZCASH_MODE === "live"
  ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform"
  : "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform";

// JazzCash's Web Checkout computes a secure hash as:
//   HMAC-SHA256(IntegritySalt, IntegritySalt + "&" + <values of every
//   pp_ field, sorted alphabetically by key, joined with "&">)
// then uppercased hex. This is the standard documented in JazzCash's
// Web Checkout (HTTP POST) integration guide — verify field names/version
// against the specific PDF your JazzCash merchant account manager
// provides, as JazzCash has revised parameters between API versions.
const buildSecureHash = (params) => {
  const salt = process.env.JAZZCASH_INTEGRITY_SALT;
  const sortedValues = Object.keys(params).sort().map((k) => params[k]).join("&");
  const hashInput = `${salt}&${sortedValues}`;
  return crypto.createHmac("sha256", salt).update(hashInput).digest("hex").toUpperCase();
};

const fmtDateTime = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

// Builds the full field set for JazzCash's auto-submitting checkout form.
// Amount must be in paisas (order.totalAmount rupees * 100), no decimals.
export const buildJazzCashCheckoutFields = (order, returnUrl) => {
  if (!isConfigured()) throw new Error("JazzCash is not configured on this server");
  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour to complete payment

  const fields = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
    pp_Password: process.env.JAZZCASH_PASSWORD,
    pp_TxnRefNo: `T${order.orderId.replace(/[^a-zA-Z0-9]/g, "")}${now.getTime()}`,
    pp_Amount: String(Math.round(order.totalAmount * 100)),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: fmtDateTime(now),
    pp_BillReference: order.orderId,
    pp_Description: `Order ${order.orderId} - Al-Hussaini Garments`,
    pp_TxnExpiryDateTime: fmtDateTime(expiry),
    pp_ReturnURL: returnUrl,
  };
  const pp_SecureHash = buildSecureHash(fields);
  return { ...fields, pp_SecureHash, gatewayUrl: GATEWAY_URL };
};

// Verifies a callback/return payload from JazzCash by recomputing the hash
// over every field it sent back (excluding pp_SecureHash itself) and
// comparing. pp_ResponseCode === "000" means the payment succeeded.
export const verifyJazzCashResponse = (body) => {
  const { pp_SecureHash, ...rest } = body;
  const expected = buildSecureHash(rest);
  const valid = expected === pp_SecureHash;
  const success = valid && body.pp_ResponseCode === "000";
  return { valid, success };
};

export const isJazzCashEnabled = isConfigured;
