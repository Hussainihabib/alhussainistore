import Wishlist from "../models/Wishlist.js";

// Wishlist is scoped to req.user (set by the `protect` middleware from the
// customer's own JWT), so a customer can only ever read/modify their own list.

export const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ customer: req.user._id })
    .populate({
      path: "products",
      match: { isActive: true },
      populate: { path: "category" }
    });
  res.json(wishlist?.products || []);
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "productId is required" });
  const wishlist = await Wishlist.findOneAndUpdate(
    { customer: req.user._id },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  ).populate("products");
  res.json(wishlist.products);
};

export const removeFromWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { customer: req.user._id },
    { $pull: { products: req.params.productId } },
    { new: true }
  ).populate("products");
  res.json(wishlist?.products || []);
};
