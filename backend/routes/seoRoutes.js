import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const r = Router();

const STATIC_PATHS = [
  "/", "/shop", "/about", "/contact", "/faq",
  "/privacy-policy", "/terms-conditions", "/shipping-policy", "/return-policy"
];

r.get("/sitemap.xml", async (req, res) => {
  const base = (process.env.CLIENT_URL || "").split(",")[0] || "";
  const [products, categories] = await Promise.all([
    Product.find({ isActive: true }).select("slug _id updatedAt"),
    Category.find().select("slug _id")
  ]);

  const urls = [
    ...STATIC_PATHS.map((p) => ({ loc: `${base}${p}`, priority: p === "/" ? "1.0" : "0.7" })),
    ...categories.map((c) => ({ loc: `${base}/shop?category=${c.slug || c._id}`, priority: "0.6" })),
    ...products.map((p) => ({ loc: `${base}/product/${p.slug || p._id}`, lastmod: p.updatedAt?.toISOString(), priority: "0.8" }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
});

r.get("/robots.txt", (req, res) => {
  const base = (process.env.CLIENT_URL || "").split(",")[0] || "";
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /cart\nSitemap: ${base}/sitemap.xml\n`);
});

export default r;
