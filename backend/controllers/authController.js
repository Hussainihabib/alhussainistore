import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

const sendAuth = (res, user, status = 200) => {
  const token = signToken(user._id, user.role);
  const safe = user.toObject ? user.toObject() : user;
  delete safe.password;
  res.status(status).json({ token, user: safe });
};

export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: "This email is already registered. Please login instead." });
  const user = await User.create({ name, email, password, phone, role: "customer" });
  sendAuth(res, user, 201);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase(), role: "customer" }).select("+password");
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Invalid email or password" });
  if (!user.isActive) return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
  sendAuth(res, user);
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase(), role: "admin" }).select("+password");
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Invalid admin email or password" });
  if (!user.isActive) return res.status(403).json({ message: "Admin account is unavailable" });
  sendAuth(res, user);
};

export const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: "Google credential is required" });
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(500).json({ message: "Google login is not configured on the server" });
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) return res.status(401).json({ message: "Google account email could not be verified" });
    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (user && user.role !== "customer") return res.status(403).json({ message: "Please use the separate admin login page" });
    if (user && !user.isActive) return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        password: `google_${payload.sub}_${Date.now()}_${Math.random()}`,
        role: "customer",
      });
    }
    sendAuth(res, user);
  } catch (error) {
    res.status(401).json({ message: "Google login verification failed" });
  }
};

export const me = async (req, res) => res.json(req.user);
export const adminMe = async (req, res) => res.json(req.user);

export const updateProfile = async (req, res) => { ["name", "phone"].forEach(k => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; }); await req.user.save(); res.json(req.user); };
export const saveAddress = async (req, res) => { const address = req.body; if (address.isDefault) req.user.addresses.forEach(a => a.isDefault = false); req.user.addresses.push(address); await req.user.save(); res.status(201).json(req.user.addresses); };
export const deleteAddress = async (req, res) => { req.user.addresses = req.user.addresses.filter(a => a._id.toString() !== req.params.id); await req.user.save(); res.json(req.user.addresses); };

// Always responds with the same generic message whether or not the email
// exists, so this endpoint can't be used to enumerate registered emails.
export const forgotPassword = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const generic = { message: "If an account exists for that email, a password reset link has been sent." };
  if (!email) return res.status(400).json({ message: "Email is required" });
  const user = await User.findOne({ email, role: "customer" });
  if (!user) return res.json(generic);

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${(process.env.CLIENT_URL || "").split(",")[0] || ""}/reset-password/${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Al-Hussaini Garments password",
    html: `<p>Hello ${user.name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`
  });
  res.json(generic);
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } }).select("+resetPasswordToken +resetPasswordExpires");
  if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired" });
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  sendAuth(res, user);
};
