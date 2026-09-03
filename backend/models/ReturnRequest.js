import mongoose from "mongoose";
const schema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Return","Exchange"], required: true },
  reason: String,
  details: String,
  images: [String],
  status: { type: String, enum: ["Pending","Approved","Rejected","Completed"], default: "Pending" },
  adminNote: String
}, { timestamps: true });
export default mongoose.model("ReturnRequest", schema);
