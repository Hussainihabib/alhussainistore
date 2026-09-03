import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: String,
  isCover: { type: Boolean, default: false }
}, { _id: true });

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, default: "Default" },
  stock: { type: Number, required: true, min: 0 },
  sku: String
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  images: [imageSchema],
  variants: [variantSchema],
  sellingPrice: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  purchaseCost: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  seoTitle: String,
  seoDescription: String,
  tags: [String],
  totalSold: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.virtual("totalStock").get(function() {
if (!Array.isArray(this.variants)) {
  return Number(this.stock) || 0;
}

return this.variants.reduce(
  (sum, variant) => sum + (Number(variant.stock) || 0),
  0
);
});
productSchema.set("toJSON", { virtuals: true });
export default mongoose.model("Product", productSchema);
