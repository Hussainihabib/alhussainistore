import {Router} from "express"; import * as c from "../controllers/productController.js"; import {protect,adminOnly} from "../middleware/auth.js";
const r=Router();r.get("/",c.getCategories);r.post("/",protect,adminOnly,c.createCategory);r.patch("/:id",protect,adminOnly,c.updateCategory);r.delete("/:id",protect,adminOnly,c.deleteCategory);export default r;
