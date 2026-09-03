import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title: String, subtitle: String, buttonText: String, buttonLink: String,
  image: String, publicId: String, isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model("Banner", schema);
