import { Router } from "express";
import { subscribe } from "../controllers/newsletterController.js";

const r = Router();
r.post("/subscribe", subscribe);
export default r;
