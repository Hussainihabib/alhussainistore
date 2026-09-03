import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import connectDB from "./config/db.js";

import {
  notFound,
  errorHandler,
} from "./middleware/error.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminPublicRoutes from "./routes/adminPublicRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import {
  stripeWebhook,
} from "./controllers/paymentController.js";


const app = express();


/* =========================================
   DATABASE CONNECTION MIDDLEWARE
========================================= */

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});


/* =========================================
   SECURITY
========================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);


/* =========================================
   CORS
========================================= */

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(
      (url) => url.trim()
    )
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);


/* =========================================
   STRIPE WEBHOOK
   MUST COME BEFORE express.json()
========================================= */

app.post(
  "/api/payments/stripe/webhook",
  express.raw({
    type: "application/json",
  }),
  stripeWebhook
);


/* =========================================
   BODY PARSERS
========================================= */

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


/* =========================================
   LOGGING
========================================= */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}


/* =========================================
   RATE LIMIT
========================================= */

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  })
);


/* =========================================
   HEALTH CHECK
========================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      ok: true,
      name: "Al-Hussaini Garments API",
    });
  }
);


/* =========================================
   API ROUTES
========================================= */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/customer",
  customerRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/admin-public",
  adminPublicRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/newsletter",
  newsletterRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/",
  seoRoutes
);


/* =========================================
   ERROR HANDLERS
========================================= */

app.use(notFound);

app.use(errorHandler);


/* =========================================
   LOCAL SERVER ONLY
========================================= */

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(
    PORT,
    () => {
      console.log(
        `API running on http://localhost:${PORT}`
      );
    }
  );
}


/* =========================================
   EXPORT FOR VERCEL
========================================= */

export default app;