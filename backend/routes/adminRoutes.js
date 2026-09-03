import {Router} from "express";import * as c from "../controllers/adminController.js";import {protect,adminOnly} from "../middleware/auth.js";const r=Router();r.use(protect,adminOnly);
r.get("/dashboard",c.dashboard);r.get("/inventory",c.getInventory);
r.get("/users",c.getUsers);r.patch("/users/:id/toggle",c.toggleUser);
r.get("/support",c.getSupportTickets);r.patch("/support/:id",c.updateSupportTicket);
r.get("/coupons",c.getCoupons);r.post("/coupons",c.saveCoupon);r.patch("/coupons/:id",c.saveCoupon);r.delete("/coupons/:id",c.deleteCoupon);
r.get("/banners",c.getBanners);r.post("/banners",c.saveBanner);r.patch("/banners/:id",c.saveBanner);r.delete("/banners/:id",c.deleteBanner);
r.get("/settings",c.getSettings);r.put("/settings",c.saveSettings);r.get("/returns",c.getReturns);r.patch("/returns/:id",c.updateReturn);r.get("/reviews",c.getReviews);r.patch("/reviews/:id",c.updateReview);r.delete("/reviews/:id",c.deleteReview);
r.get("/newsletter",c.getNewsletterSubscribers);r.delete("/newsletter/:id",c.deleteNewsletterSubscriber);r.patch("/newsletter/:id/toggle",c.toggleNewsletterSubscriber);
export default r;
