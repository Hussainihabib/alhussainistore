import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Recomputes a product's average rating and review count from its
// Approved reviews only. Call this after any review's status changes
// or a review is deleted.
export const recalculateProductRating = async (productId) => {
  if (!productId) return;
  const approved = await Review.find({ product: productId, status: "Approved" }).select("rating");
  const reviewCount = approved.length;
  const rating = reviewCount
    ? Math.round((approved.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : 0;
  await Product.findByIdAndUpdate(productId, { rating, reviewCount });
};
