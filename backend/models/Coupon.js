import mongoose from "mongoose";
const schema = new mongoose.Schema({
  code: { type: String, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ["percentage","fixed","free_shipping"], default: "percentage" },
  value: { type: Number, default: 0 },
  minimumOrder: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("Coupon", schema);
