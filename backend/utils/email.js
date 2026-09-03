import nodemailer from "nodemailer";

// If SMTP isn't configured yet, we don't want password-reset (or any other
// transactional email) to silently pretend to work. We log the content to
// the server console instead, so the flow is still testable in dev, and we
// tell the caller whether a real email was actually sent.
const hasSmtpConfig = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter = null;
const getTransporter = () => {
  if (!hasSmtpConfig()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`\n[EMAIL NOT SENT — SMTP not configured] To: ${to}\nSubject: ${subject}\n${html}\n`);
    return { sent: false };
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || `"Al-Hussaini Garments" <${process.env.SMTP_USER}>`,
      to, subject, html
    });
    return { sent: true };
  } catch (error) {
    console.error("Email send failed:", error.message);
    return { sent: false };
  }
};

// Sent right after an order is placed (any payment method — for COD/Bank
// Transfer/Easypaisa/JazzCash manual instructions, and again the customer
// still gets this immediate acknowledgement). Silently no-ops if the order
// has no email on file (shouldn't happen — email is required at checkout).
export const sendOrderConfirmationEmail = async (order) => {
  if (!order?.email) return;
  const rows = (order.items || []).map(i =>
    `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${i.name} (${i.size || "-"} / ${i.color || "-"}) × ${i.quantity}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">PKR ${(i.price * i.quantity).toLocaleString()}</td></tr>`
  ).join("");
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#581845">Thanks for your order, ${order.customerName || "there"}!</h2>
      <p>Your order <b>${order.orderId}</b> has been received and is <b>${order.status}</b>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:10px">${rows}</table>
      <p style="margin-top:14px">Subtotal: PKR ${Number(order.subtotal||0).toLocaleString()}<br/>
      ${order.discount ? `Discount: - PKR ${Number(order.discount).toLocaleString()}<br/>` : ""}
      Shipping: PKR ${Number(order.shippingAmount||0).toLocaleString()}<br/>
      <b>Total: PKR ${Number(order.totalAmount||0).toLocaleString()}</b></p>
      <p>Payment Method: ${order.paymentMethod} (${order.paymentStatus})</p>
      <p style="margin-top:16px">You can track your order anytime using Order ID <b>${order.orderId}</b> on our Track Order page.</p>
    </div>`;
  await sendEmail({ to: order.email, subject: `Order Confirmed — ${order.orderId}`, html });
};

// Sent when a payment gateway (Stripe / JazzCash) confirms payment.
export const sendPaymentConfirmedEmail = async (order) => {
  if (!order?.email) return;
  await sendEmail({
    to: order.email,
    subject: `Payment Received — ${order.orderId}`,
    html: `<p>We've received your payment of <b>PKR ${Number(order.totalAmount||0).toLocaleString()}</b> for order <b>${order.orderId}</b>. Thank you!</p>`
  });
};
