import validator from "validator";
import Newsletter from "../models/Newsletter.js";

export const subscribe = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (existing.status === "Inactive") {
      existing.status = "Active";
      await existing.save();
      return res.json({ message: "Subscribed successfully" });
    }
    return res.status(400).json({ message: "This email is already subscribed" });
  }
  await Newsletter.create({ email });
  res.status(201).json({ message: "Subscribed successfully" });
};

// Admin
export const getSubscribers = async (req, res) => {
  res.json(await Newsletter.find().sort({ createdAt: -1 }));
};

export const removeSubscriber = async (req, res) => {
  await Newsletter.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

export const toggleSubscriber = async (req, res) => {
  const sub = await Newsletter.findById(req.params.id);
  if (!sub) return res.status(404).json({ message: "Subscriber not found" });
  sub.status = sub.status === "Active" ? "Inactive" : "Active";
  await sub.save();
  res.json(sub);
};
