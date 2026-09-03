import { uploadBuffer } from "../utils/cloudinaryUpload.js";

export const uploadImages = async (req,res) => {
  if (!req.files?.length) return res.status(400).json({message:"No images selected"});
  const folder = req.body.folder === "banners" ? "al-hussaini-garments/banners" : "al-hussaini-garments/products";
  const images = await Promise.all(req.files.map(f => uploadBuffer(f.buffer, folder)));
  res.status(201).json(images);
};
