import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

export const uploadBuffer = (buffer, folder="al-hussaini-garments") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] },
      (error, result) => error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id })
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
