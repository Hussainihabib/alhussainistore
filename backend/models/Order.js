import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String, image: String, size: String, color: String,
  quantity: Number, price: Number, variantId: String
}, { _id: false });

const schema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerName: String,
  phone: String,
  email: String,
  address: { city: String, area: String, addressLine: String, postalCode: String, instructions: String },
  items: [itemSchema],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  shippingAmount: { type: Number, default: 0 },
  totalAmount: Number,
  couponCode: String,
  paymentMethod: { type: String, enum: ["COD","Bank Transfer","Easypaisa","JazzCash","Card"], default: "COD" },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
  paymentGatewayRef: String,
  paymentGatewayResponse: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ["Pending","Confirmed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"], default: "Pending" },
  trackingNo: String,
  courier: String,
  courierNotes: String,
  cancellationReason: String,
  cancelledAt: Date,
  stockDeducted: { type: Boolean, default: true },
  stockRestored: { type: Boolean, default: false },
  timeline: [{ status: String, note: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true });
export default mongoose.model("Order", schema);
