import {Router} from "express";import Banner from "../models/Banner.js";import Setting from "../models/Setting.js";
const r=Router();
r.get("/banners",async(req,res)=>{res.json(await Banner.find({isActive:true}).sort({sortOrder:1}));});
// Public, safe-to-expose subset of settings (no secrets) used for the
// floating WhatsApp button, footer contact info, etc.
r.get("/settings",async(req,res)=>{
  const [contact,store,promo,analyticsSetting]=await Promise.all([Setting.findOne({key:"contact"}),Setting.findOne({key:"store"}),Setting.findOne({key:"promo"}),Setting.findOne({key:"analytics"})]);
  const analytics = {
    gaId: analyticsSetting?.value?.gaId || process.env.GA_MEASUREMENT_ID || "",
    metaPixelId: analyticsSetting?.value?.metaPixelId || process.env.META_PIXEL_ID || ""
  };
  res.json({contact:contact?.value||{},store:store?.value||{},promo:promo?.value||{},analytics});
});
export default r;
