import Product from "../models/Product.js";

export const generateOrderId = () =>
  `AHG-${Date.now().toString().slice(-7)}${Math.floor(Math.random()*90+10)}`;

// Restores variant stock for a cancelled order exactly once.
// Safe to call multiple times: the stockRestored flag on the order
// document prevents double-restoration.
export const restoreStockForOrder = async (order) => {
  if (!order || order.stockRestored || !order.stockDeducted) return false;
  for (const item of order.items) {
    if (!item.product || !item.variantId) continue;
    try {
      const product = await Product.findById(item.product);
      if (!product) continue;
      const variant = product.variants.id(item.variantId);
      if (!variant) continue;
      variant.stock += Number(item.quantity) || 0;
      product.totalSold = Math.max(0, (Number(product.totalSold) || 0) - (Number(item.quantity) || 0));
      await product.save();
    } catch {
      // Skip items whose product/variant no longer exists; continue restoring the rest.
      continue;
    }
  }
  order.stockRestored = true;
  return true;
};
