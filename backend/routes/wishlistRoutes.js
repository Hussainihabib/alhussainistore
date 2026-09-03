import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";

const r = Router();
r.use(protect);
r.get("/", getWishlist);
r.post("/", addToWishlist);
r.delete("/:productId", removeFromWishlist);
export default r;
