import {Router} from "express";
import {protect} from "../middleware/auth.js";
import {getProductReviews,createReview} from "../controllers/reviewController.js";
const r=Router();
r.get("/product/:productId",getProductReviews);
r.post("/product/:productId",protect,createReview);
export default r;
