import SupportTicket from "../models/SupportTicket.js";
import validator from "validator";
export const createSupport=async(req,res)=>{const {subject,message}=req.body;if(!subject?.trim()||!message?.trim())return res.status(400).json({message:"Subject and message are required"});const t=await SupportTicket.create({customer:req.user._id,name:req.user.name,email:req.user.email,subject:subject.trim(),message:message.trim()});res.status(201).json(t);};
export const mySupport=async(req,res)=>res.json(await SupportTicket.find({customer:req.user._id}).sort({createdAt:-1}));

// Public contact form — no login required. Lands in the same admin
// Support inbox as logged-in customer tickets, just without a `customer`
// reference, so the admin has one place to manage all incoming messages.
export const submitContactForm = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = String(req.body.phone || "").trim();
  const subject = String(req.body.subject || "Website Contact Form").trim();
  const message = String(req.body.message || "").trim();
  if (!name || !message) return res.status(400).json({ message: "Name and message are required" });
  if (!email || !validator.isEmail(email)) return res.status(400).json({ message: "Please enter a valid email address" });
  const t = await SupportTicket.create({ name, email, phone, subject, message });
  res.status(201).json({ message: "Thanks for reaching out — our team will get back to you soon.", ticket: t });
};
