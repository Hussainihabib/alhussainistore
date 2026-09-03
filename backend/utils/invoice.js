import PDFDocument from "pdfkit";

// Streams a professional invoice PDF for the given order directly to the
// HTTP response. `store` carries configurable shop details (name, contact,
// address) so nothing here is hardcoded beyond sensible fallbacks.
export const generateInvoicePDF = (res, order, store = {}) => {
  const storeName = store.name || "Al-Hussaini Garments";
  const storeContact = store.contact || "";
  const storeAddress = store.address || "";

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderId}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).fillColor("#1c1917").text(storeName, { continued: false });
  doc.fontSize(9).fillColor("#57534e");
  if (storeContact) doc.text(storeContact);
  if (storeAddress) doc.text(storeAddress);
  doc.moveDown(1);

  doc.fontSize(14).fillColor("#1c1917").text("INVOICE", { align: "right" });
  doc.fontSize(9).fillColor("#57534e")
    .text(`Order ID: ${order.orderId}`, { align: "right" })
    .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: "right" })
    .text(`Payment Method: ${order.paymentMethod}`, { align: "right" })
    .text(`Payment Status: ${order.paymentStatus}`, { align: "right" })
    .text(`Order Status: ${order.status}`, { align: "right" });

  doc.moveDown(1);
  doc.strokeColor("#e7e5e4").moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.8);

  // Bill to
  doc.fontSize(10).fillColor("#1c1917").text("Bill To:", { underline: false });
  doc.fontSize(9).fillColor("#44403c")
    .text(order.customerName || "")
    .text(order.email || "")
    .text(order.phone || "")
    .text([order.address?.addressLine, order.address?.area, order.address?.city, order.address?.postalCode].filter(Boolean).join(", "));
  if (order.address?.instructions) doc.text(`Delivery notes: ${order.address.instructions}`);

  doc.moveDown(1);

  // Items table
  const tableTop = doc.y;
  const cols = { name: 40, size: 240, color: 300, qty: 360, price: 410, total: 480 };
  doc.fontSize(9).fillColor("#ffffff");
  doc.rect(40, tableTop, 515, 20).fill("#1c1917");
  doc.fillColor("#ffffff")
    .text("Product", cols.name + 4, tableTop + 6)
    .text("Size", cols.size, tableTop + 6)
    .text("Color", cols.color, tableTop + 6)
    .text("Qty", cols.qty, tableTop + 6)
    .text("Price", cols.price, tableTop + 6)
    .text("Total", cols.total, tableTop + 6);

  let y = tableTop + 24;
  doc.fillColor("#292524").fontSize(9);
  (order.items || []).forEach((item, idx) => {
    if (y > 740) { doc.addPage(); y = 40; }
    if (idx % 2 === 0) doc.rect(40, y - 4, 515, 20).fill("#f5f5f4").fillColor("#292524");
    doc.text(String(item.name || "").slice(0, 34), cols.name + 4, y, { width: 190 });
    doc.text(item.size || "-", cols.size, y);
    doc.text(item.color || "-", cols.color, y);
    doc.text(String(item.quantity), cols.qty, y);
    doc.text(`Rs ${Number(item.price).toLocaleString()}`, cols.price, y);
    doc.text(`Rs ${(Number(item.price) * Number(item.quantity)).toLocaleString()}`, cols.total, y);
    y += 20;
  });

  y += 10;
  doc.strokeColor("#e7e5e4").moveTo(320, y).lineTo(555, y).stroke();
  y += 10;

  const summaryLine = (label, value) => {
    doc.fontSize(9).fillColor("#57534e").text(label, 320, y);
    doc.fontSize(9).fillColor("#1c1917").text(value, 480, y);
    y += 16;
  };
  summaryLine("Subtotal", `Rs ${Number(order.subtotal || 0).toLocaleString()}`);
  if (order.discount) summaryLine(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `- Rs ${Number(order.discount).toLocaleString()}`);
  summaryLine("Shipping", `Rs ${Number(order.shippingAmount || 0).toLocaleString()}`);
  doc.fontSize(11).fillColor("#1c1917").text("Grand Total", 320, y, { continued: false });
  doc.fontSize(11).fillColor("#1c1917").text(`Rs ${Number(order.totalAmount || 0).toLocaleString()}`, 480, y);

  doc.moveDown(4);
  doc.fontSize(8).fillColor("#a8a29e").text("Thank you for shopping with us.", 40, doc.y, { align: "center", width: 515 });

  doc.end();
};
