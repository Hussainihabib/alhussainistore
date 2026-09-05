import nodemailer from "nodemailer";

const hasSmtpConfig = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

let transporter = null;

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();

  if (!t) {
    console.log(`
[EMAIL NOT SENT — SMTP not configured]

To: ${to}
Subject: ${subject}

${html}
`);
    return { sent: false };
  }

  try {
    await t.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Al-Hussaini Garments" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to: ${to}`);
    return { sent: true };
  } catch (error) {
    console.error("Email send failed:", error.message);
    return { sent: false };
  }
};

const getEmailWrapper = ({ title, content }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f8f7f4;
        font-family:Arial,Helvetica,sans-serif;
        color:#252027;
      ">

        <div style="
          max-width:620px;
          margin:30px auto;
          background:#ffffff;
          border-radius:12px;
          overflow:hidden;
          box-shadow:0 4px 18px rgba(0,0,0,0.08);
        ">

          <div style="
            background:#581845;
            padding:28px 25px;
            text-align:center;
          ">
            <h1 style="
              margin:0;
              font-size:26px;
              color:#ffffff;
            ">
              AL-HUSSAINI
              <span style="color:#FFD700;">
                GARMENTS
              </span>
            </h1>
          </div>

          <div style="padding:30px 25px;">

            <h2 style="
              color:#581845;
              margin-top:0;
            ">
              ${title}
            </h2>

            ${content}

          </div>

          <div style="
            background:#f3f0ed;
            padding:18px 25px;
            text-align:center;
            font-size:12px;
            color:#777;
          ">
            <p style="margin:0 0 8px;">
              Thank you for choosing
              <strong>Al-Hussaini Garments</strong>
            </p>

            <p style="margin:0;">
              Quality kids clothing with comfortable styles.
            </p>
          </div>

        </div>

      </body>
    </html>
  `;
};

/* =========================================================
   WELCOME EMAIL
========================================================= */

export const sendWelcomeEmail = async (user) => {
  if (!user?.email) return;

  const customerName =
    user.name ||
    user.customerName ||
    "Dear Customer";

  const html = getEmailWrapper({
    title: `Welcome to Al-Hussaini Garments, ${customerName}! 🎉`,

    content: `
      <p style="
        font-size:16px;
        line-height:1.7;
      ">
        Thank you for creating your account with
        <strong>Al-Hussaini Garments</strong>.
      </p>

      <p style="
        font-size:16px;
        line-height:1.7;
      ">
        We are delighted to have you as part of our family.
        You can now explore our collection and enjoy a smooth
        shopping experience.
      </p>

      <div style="
        background:#f8f7f4;
        border-left:4px solid #FFD700;
        padding:18px;
        margin:20px 0;
        border-radius:6px;
      ">
        <p style="margin:0;">
          <strong>
            Your account has been successfully created!
          </strong>
        </p>
      </div>

      <p style="
        font-size:16px;
        line-height:1.7;
      ">
        We hope you find something special for your little ones. ❤️
      </p>

      <p style="
        margin-top:25px;
        font-size:16px;
      ">
        Happy Shopping!<br/>
        <strong>Al-Hussaini Garments Team</strong>
      </p>
    `,
  });

  return await sendEmail({
    to: user.email,
    subject: "Welcome to Al-Hussaini Garments 🎉",
    html,
  });
};

/* =========================================================
   NEW CUSTOMER → ADMIN EMAIL
========================================================= */

export const sendNewCustomerAdminEmail = async (user) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn(
      "ADMIN_EMAIL is not configured. Admin registration notification was not sent."
    );

    return { sent: false };
  }

  const customerName =
    user?.name ||
    user?.customerName ||
    "Not Available";

  const customerEmail =
    user?.email ||
    "Not Available";

  const customerPhone =
    user?.phone ||
    "Not Provided";

  const registrationDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : new Date().toLocaleString();

  const html = getEmailWrapper({
    title: "New Customer Registered 👤",

    content: `
      <p style="
        font-size:16px;
        line-height:1.7;
      ">
        A new customer has created an account on
        <strong>Al-Hussaini Garments</strong>.
      </p>

      <table style="
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
      ">

        <tr>
          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
            width:35%;
          ">
            <strong>Customer Name</strong>
          </td>

          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
          ">
            ${customerName}
          </td>
        </tr>

        <tr>
          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Email</strong>
          </td>

          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
          ">
            ${customerEmail}
          </td>
        </tr>

        <tr>
          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Phone</strong>
          </td>

          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
          ">
            ${customerPhone}
          </td>
        </tr>

        <tr>
          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Registration Time</strong>
          </td>

          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
          ">
            ${registrationDate}
          </td>
        </tr>

      </table>

      <p style="margin-top:22px;">
        You can view the customer from your admin dashboard.
      </p>
    `,
  });

  return await sendEmail({
    to: adminEmail,
    subject: `New Customer Registered — ${customerName}`,
    html,
  });
};

/* =========================================================
   ORDER CONFIRMATION → CUSTOMER
========================================================= */

export const sendOrderConfirmationEmail = async (order) => {
  if (!order?.email) return;

  const rows = (order.items || [])
    .map(
      (i) => `
        <tr>
          <td style="
            padding:6px 10px;
            border-bottom:1px solid #eee;
          ">
            ${i.name}
            (${i.size || "-"} / ${i.color || "-"}) ×
            ${i.quantity}
          </td>

          <td style="
            padding:6px 10px;
            border-bottom:1px solid #eee;
            text-align:right;
          ">
            PKR ${(i.price * i.quantity).toLocaleString()}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="
      font-family:sans-serif;
      max-width:520px;
      margin:auto;
    ">

      <h2 style="color:#581845;">
        Thanks for your order,
        ${order.customerName || "there"}!
      </h2>

      <p>
        Your order
        <b>${order.orderId}</b>
        has been received and is
        <b>${order.status}</b>.
      </p>

      <table style="
        width:100%;
        border-collapse:collapse;
        margin-top:10px;
      ">
        ${rows}
      </table>

      <p style="margin-top:14px;">
        Subtotal:
        PKR ${Number(order.subtotal || 0).toLocaleString()}
        <br/>

        ${
          order.discount
            ? `
              Discount:
              - PKR ${Number(order.discount).toLocaleString()}
              <br/>
            `
            : ""
        }

        Shipping:
        PKR ${Number(order.shippingAmount || 0).toLocaleString()}

        <br/>

        <b>
          Total:
          PKR ${Number(order.totalAmount || 0).toLocaleString()}
        </b>
      </p>

      <p>
        Payment Method:
        ${order.paymentMethod}
        (${order.paymentStatus})
      </p>

      <p style="margin-top:16px;">
        You can track your order anytime using
        Order ID
        <b>${order.orderId}</b>
        on our Track Order page.
      </p>

    </div>
  `;

  await sendEmail({
    to: order.email,
    subject: `Order Confirmed — ${order.orderId}`,
    html,
  });
};

/* =========================================================
   PAYMENT CONFIRMED → CUSTOMER
========================================================= */

export const sendPaymentConfirmedEmail = async (order) => {
  if (!order?.email) return;

  await sendEmail({
    to: order.email,

    subject: `Payment Received — ${order.orderId}`,

    html: `
      <p>
        We've received your payment of
        <b>
          PKR ${Number(
            order.totalAmount || 0
          ).toLocaleString()}
        </b>
        for order
        <b>${order.orderId}</b>.
      </p>

      <p>
        Thank you!
      </p>
    `,
  });
};

/* =========================================================
   NEW ORDER → ADMIN
========================================================= */

export const sendNewOrderAdminEmail = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn(
      "ADMIN_EMAIL is not configured. New order admin notification was not sent."
    );

    return { sent: false };
  }

  if (!order) {
    return { sent: false };
  }

  const itemsRows = (order.items || [])
    .map(
      (item) => `
        <tr>

          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
          ">
            <strong>
              ${item.name || "Product"}
            </strong>

            <br/>

            <span style="
              color:#777;
              font-size:13px;
            ">
              Size: ${item.size || "-"} |
              Color: ${item.color || "-"}
            </span>
          </td>

          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
            text-align:center;
          ">
            ${item.quantity || 0}
          </td>

          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
            text-align:right;
          ">
            PKR ${Number(
              item.price || 0
            ).toLocaleString()}
          </td>

          <td style="
            padding:12px;
            border:1px solid #e5e5e5;
            text-align:right;
          ">
            PKR ${(
              Number(item.price || 0) *
              Number(item.quantity || 0)
            ).toLocaleString()}
          </td>

        </tr>
      `
    )
    .join("");

  const address = order.address || {};

  const html = getEmailWrapper({
    title: "New Order Received 🛍️",

    content: `
      <p style="
        font-size:16px;
        line-height:1.7;
      ">
        A new order has been successfully placed on
        <strong>Al-Hussaini Garments</strong>.
      </p>

      <div style="
        background:#f8f7f4;
        border-left:4px solid #FFD700;
        padding:18px;
        margin:20px 0;
        border-radius:6px;
      ">

        <p style="margin:0 0 8px;">
          <strong>Order ID:</strong>
          ${order.orderId || "-"}
        </p>

        <p style="margin:0;">
          <strong>Status:</strong>
          ${order.status || "Pending"}
        </p>

      </div>

      <h3 style="color:#581845;">
        Customer Information
      </h3>

      <table style="
        width:100%;
        border-collapse:collapse;
      ">

        <tr>
          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Name</strong>
          </td>

          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
          ">
            ${order.customerName || "-"}
          </td>
        </tr>

        <tr>
          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Email</strong>
          </td>

          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
          ">
            ${order.email || "-"}
          </td>
        </tr>

        <tr>
          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Phone</strong>
          </td>

          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
          ">
            ${order.phone || "-"}
          </td>
        </tr>

      </table>

      <h3 style="
        color:#581845;
        margin-top:25px;
      ">
        Delivery Address
      </h3>

      <div style="
        background:#f8f7f4;
        padding:15px;
        border-radius:8px;
        line-height:1.7;
      ">
        ${address.street || address.address || ""}
        <br/>
        ${address.area || ""}
        ${address.city ? `<br/>${address.city}` : ""}
        ${address.province ? `, ${address.province}` : ""}
        ${
          address.postalCode
            ? ` - ${address.postalCode}`
            : ""
        }
      </div>

      <h3 style="
        color:#581845;
        margin-top:25px;
      ">
        Order Items
      </h3>

      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:14px;
      ">

        <thead>
          <tr style="
            background:#581845;
            color:#ffffff;
          ">

            <th style="
              padding:12px;
              text-align:left;
            ">
              Product
            </th>

            <th style="
              padding:12px;
              text-align:center;
            ">
              Qty
            </th>

            <th style="
              padding:12px;
              text-align:right;
            ">
              Price
            </th>

            <th style="
              padding:12px;
              text-align:right;
            ">
              Total
            </th>

          </tr>
        </thead>

        <tbody>
          ${itemsRows}
        </tbody>

      </table>

      <div style="
        margin-top:20px;
        background:#f8f7f4;
        padding:18px;
        border-radius:8px;
      ">

        <p style="margin:5px 0;">
          <strong>Subtotal:</strong>
          PKR ${Number(
            order.subtotal || 0
          ).toLocaleString()}
        </p>

        ${
          order.discount
            ? `
              <p style="margin:5px 0;">
                <strong>Discount:</strong>
                - PKR ${Number(
                  order.discount
                ).toLocaleString()}
              </p>
            `
            : ""
        }

        <p style="margin:5px 0;">
          <strong>Shipping:</strong>
          PKR ${Number(
            order.shippingAmount || 0
          ).toLocaleString()}
        </p>

        <p style="
          margin:12px 0 0;
          padding-top:12px;
          border-top:1px solid #ddd;
          font-size:18px;
          color:#581845;
        ">
          <strong>Total:</strong>
          PKR ${Number(
            order.totalAmount || 0
          ).toLocaleString()}
        </p>

      </div>

      <div style="
        margin-top:20px;
        padding:15px;
        border:1px solid #e5e5e5;
        border-radius:8px;
      ">

        <p style="margin:5px 0;">
          <strong>Payment Method:</strong>
          ${order.paymentMethod || "-"}
        </p>

        <p style="margin:5px 0;">
          <strong>Payment Status:</strong>
          ${order.paymentStatus || "-"}
        </p>

      </div>

      <p style="
        margin-top:25px;
        font-size:15px;
        color:#555;
      ">
        Please review this order from the admin dashboard
        and process it accordingly.
      </p>
    `,
  });

  return await sendEmail({
    to: adminEmail,
    subject: `🛍️ New Order Received — ${order.orderId}`,
    html,
  });
};

/* =========================================================
   ORDER CANCELLED → CUSTOMER
========================================================= */

export const sendOrderCancellationCustomerEmail = async (order) => {
  if (!order?.email) {
    return { sent: false };
  }

  const customerName =
    order.customerName || "Dear Customer";

  const cancellationReason =
    order.cancellationReason ||
    "No reason provided";

  const cancelledAt = order.cancelledAt
    ? new Date(order.cancelledAt).toLocaleString()
    : new Date().toLocaleString();

  const html = getEmailWrapper({
    title: "Order Cancelled ❌",

    content: `
      <p style="
        font-size:16px;
        line-height:1.7;
      ">
        Dear <strong>${customerName}</strong>,
      </p>

      <p style="
        font-size:16px;
        line-height:1.7;
      ">
        Your order cancellation request has been
        successfully processed.
      </p>

      <div style="
        background:#fff7f7;
        border-left:4px solid #c0392b;
        padding:18px;
        margin:20px 0;
        border-radius:6px;
      ">

        <p style="margin:0 0 8px;">
          <strong>Order ID:</strong>
          ${order.orderId || "-"}
        </p>

        <p style="margin:0 0 8px;">
          <strong>Status:</strong>
          Cancelled
        </p>

        <p style="margin:0 0 8px;">
          <strong>Cancellation Reason:</strong>
          ${cancellationReason}
        </p>

        <p style="margin:0;">
          <strong>Cancelled At:</strong>
          ${cancelledAt}
        </p>

      </div>

      <div style="
        background:#f8f7f4;
        padding:18px;
        border-radius:8px;
      ">

        <p style="margin:5px 0;">
          <strong>Order Total:</strong>
          PKR ${Number(
            order.totalAmount || 0
          ).toLocaleString()}
        </p>

        <p style="margin:5px 0;">
          <strong>Payment Method:</strong>
          ${order.paymentMethod || "-"}
        </p>

      </div>

      <p style="
        font-size:15px;
        line-height:1.7;
        margin-top:22px;
      ">
        If you did not request this cancellation or
        need any assistance, please contact
        Al-Hussaini Garments support.
      </p>

      <p style="
        margin-top:25px;
        font-size:16px;
      ">
        Thank you for shopping with us.<br/>
        <strong>Al-Hussaini Garments Team</strong>
      </p>
    `,
  });

  return await sendEmail({
    to: order.email,
    subject: `Order Cancelled — ${order.orderId}`,
    html,
  });
};

/* =========================================================
   ORDER CANCELLED → ADMIN
========================================================= */

export const sendOrderCancellationAdminEmail = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn(
      "ADMIN_EMAIL is not configured. Order cancellation admin notification was not sent."
    );

    return { sent: false };
  }

  if (!order) {
    return { sent: false };
  }

  const cancellationReason =
    order.cancellationReason ||
    "No reason provided";

  const cancelledAt = order.cancelledAt
    ? new Date(order.cancelledAt).toLocaleString()
    : new Date().toLocaleString();

  const html = getEmailWrapper({
    title: "Order Cancellation Alert ⚠️",

    content: `
      <p style="
        font-size:16px;
        line-height:1.7;
      ">
        A customer has cancelled an order on
        <strong>Al-Hussaini Garments</strong>.
      </p>

      <div style="
        background:#fff7f7;
        border-left:4px solid #c0392b;
        padding:18px;
        margin:20px 0;
        border-radius:6px;
      ">

        <p style="margin:0;">
          <strong>Order ID:</strong>
          ${order.orderId || "-"}
        </p>

      </div>

      <h3 style="color:#581845;">
        Customer Information
      </h3>

      <table style="
        width:100%;
        border-collapse:collapse;
      ">

        <tr>
          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Name</strong>
          </td>

          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
          ">
            ${order.customerName || "-"}
          </td>
        </tr>

        <tr>
          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Email</strong>
          </td>

          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
          ">
            ${order.email || "-"}
          </td>
        </tr>

        <tr>
          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
            background:#f8f7f4;
          ">
            <strong>Phone</strong>
          </td>

          <td style="
            padding:10px;
            border:1px solid #e5e5e5;
          ">
            ${order.phone || "-"}
          </td>
        </tr>

      </table>

      <h3 style="
        color:#581845;
        margin-top:25px;
      ">
        Cancellation Details
      </h3>

      <div style="
        background:#f8f7f4;
        padding:18px;
        border-radius:8px;
        line-height:1.7;
      ">

        <p style="margin:5px 0;">
          <strong>Reason:</strong>
          ${cancellationReason}
        </p>

        <p style="margin:5px 0;">
          <strong>Cancelled At:</strong>
          ${cancelledAt}
        </p>

        <p style="margin:5px 0;">
          <strong>Order Total:</strong>
          PKR ${Number(
            order.totalAmount || 0
          ).toLocaleString()}
        </p>

        <p style="margin:5px 0;">
          <strong>Payment Method:</strong>
          ${order.paymentMethod || "-"}
        </p>

      </div>

      <p style="
        margin-top:25px;
        font-size:15px;
        color:#555;
      ">
        Please review the cancelled order in the
        admin dashboard.
      </p>
    `,
  });

  return await sendEmail({
    to: adminEmail,
    subject: `⚠️ Order Cancelled — ${order.orderId}`,
    html,
  });
};

/* =========================================================
   PHASE 6
   ADMIN STATUS UPDATE → CUSTOMER
========================================================= */

export const sendOrderStatusUpdateEmail = async (order, oldStatus) => {
  // 1. Debugging Log
  console.log(`[EMAIL TRIGGERED] Order ID: ${order?.orderId}, Status: ${order?.status}`);

  // 2. Email Validation Check
  if (!order?.email) {
    console.error("❌ Email failed: Customer email is missing from order object.");
    return { sent: false, error: "Missing email address" };
  }

  const customerName = order.customerName || "Dear Customer";
  const newStatus = order.status || "Updated";
  const orderId = order.orderId || order._id || "N/A";
  const statusDate = new Date().toLocaleString();

  const isCancelled = newStatus.toLowerCase() === "cancelled";

  // Dynamic status messages for better UX
  let statusMessage = `Your order status has been updated from <strong>${oldStatus || "Previous Status"}</strong> to <strong>${newStatus}</strong>.`;
  
  if (isCancelled) {
    statusMessage = "Your order has been cancelled by our team.";
  } else if (newStatus.toLowerCase() === "shipped") {
    statusMessage = "Great news! Your order has been shipped and is on its way.";
  } else if (newStatus.toLowerCase() === "out for delivery") {
    statusMessage = "Your package is out for delivery and will reach you soon!";
  }

  const html = getEmailWrapper({
    title: isCancelled
      ? "Order Status Updated — Cancelled ❌"
      : `Order Status Updated — ${newStatus} 📦`,

    content: `
      <p style="font-size:16px; line-height:1.7;">
        Dear <strong>${customerName}</strong>,
      </p>

      <p style="font-size:16px; line-height:1.7;">
        ${statusMessage}
      </p>

      <div style="background:#f8f7f4; border-left:4px solid ${isCancelled ? '#c0392b' : '#FFD700'}; padding:18px; margin:20px 0; border-radius:6px;">
        <p style="margin:0 0 10px;"><strong>Order ID:</strong> ${orderId}</p>
        <p style="margin:0 0 10px;"><strong>Previous Status:</strong> ${oldStatus || "-"}</p>
        <p style="margin:0 0 10px;"><strong>Current Status:</strong> ${newStatus}</p>
        <p style="margin:0;"><strong>Updated At:</strong> ${statusDate}</p>
      </div>

      ${
        order.trackingNo || order.courier
          ? `
            <div style="background:#f8f7f4; padding:18px; border-radius:8px; margin-top:20px;">
              <h3 style="margin-top:0; color:#581845;">Delivery Information</h3>
              ${order.trackingNo ? `<p style="margin:6px 0;"><strong>Tracking Number:</strong> ${order.trackingNo}</p>` : ""}
              ${order.courier ? `<p style="margin:6px 0;"><strong>Courier:</strong> ${order.courier}</p>` : ""}
              ${order.courierNotes ? `<p style="margin:6px 0; line-height:1.6;"><strong>Courier Notes:</strong> ${order.courierNotes}</p>` : ""}
            </div>
          `
          : ""
      }

      ${
        isCancelled && order.cancellationReason
          ? `
            <div style="background:#fff7f7; border-left:4px solid #c0392b; padding:18px; margin-top:20px; border-radius:6px;">
              <p style="margin:0;"><strong>Cancellation Reason:</strong> ${order.cancellationReason}</p>
            </div>
          `
          : ""
      }

      <div style="background:#f8f7f4; padding:18px; border-radius:8px; margin-top:20px;">
        <p style="margin:5px 0;"><strong>Order Total:</strong> PKR ${Number(order.totalAmount || 0).toLocaleString()}</p>
        <p style="margin:5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || "-"}</p>
        <p style="margin:5px 0;"><strong>Payment Status:</strong> ${order.paymentStatus || "-"}</p>
      </div>

      <p style="margin-top:22px; font-size:15px; line-height:1.7; color:#555;">
        You can use your Order ID <strong>${orderId}</strong> to track your order.
      </p>

      <p style="margin-top:25px; font-size:16px;">
        Thank you for shopping with us.<br/>
        <strong>Al-Hussaini Garments Team</strong>
      </p>
    `,
  });

  try {
    return await sendEmail({
      to: order.email,
      subject: `Order Update [${newStatus}] — ${orderId}`,
      html,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { sent: false, error };
  }
};