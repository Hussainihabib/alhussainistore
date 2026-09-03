import { Router } from "express";
import * as c from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/auth.js";
const r = Router();
r.post("/register", c.register); r.post("/login", c.login); r.post("/google", c.googleLogin);
r.post("/forgot-password", c.forgotPassword); r.post("/reset-password/:token", c.resetPassword);
r.post("/admin/login", c.adminLogin); r.get("/admin/me", protect, adminOnly, c.adminMe);
r.get("/me", protect, c.me); r.patch("/profile", protect, c.updateProfile); r.post("/addresses", protect, c.saveAddress); r.delete("/addresses/:id", protect, c.deleteAddress);
export default r;
