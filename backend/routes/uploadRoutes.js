import {Router} from "express";import upload from "../middleware/upload.js";import {uploadImages} from "../controllers/uploadController.js";import {protect,adminOnly} from "../middleware/auth.js";
const r=Router();r.post("/images",protect,adminOnly,upload.array("images",10),uploadImages);export default r;
