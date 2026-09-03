import { Router } from "express";
import * as c from "../controllers/paymentController.js";

// NOTE: the Stripe webhook route is registered separately in server.js
// with express.raw() BEFORE express.json(), since Stripe's signature
// verification needs the raw request body. This router covers everything
// else.
const r = Router();
r.get("/config", c.getPaymentConfig);
r.post("/stripe/create-session/:orderId", c.createStripeSession);
r.post("/jazzcash/initiate/:orderId", c.jazzCashInitiate);
r.get("/jazzcash/initiate/:orderId", c.jazzCashInitiate);
r.post("/jazzcash/callback", c.jazzCashCallback);
export default r;
