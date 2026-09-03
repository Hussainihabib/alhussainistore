import mongoose from "mongoose";
const schema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
  images: [String],
  status: { type: String, enum: ["Pending","Approved","Hidden"], default: "Pending" }
}, { timestamps: true });
export default mongoose.model("Review", schema);
