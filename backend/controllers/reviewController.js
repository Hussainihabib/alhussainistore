import Review from "../models/Review.js";
import Order from "../models/Order.js";

export const getProductReviews = async (req,res) => {
  const rows = await Review.find({product:req.params.productId,status:"Approved"})
    .populate("customer","name").sort({createdAt:-1});
  res.json(rows);
};

export const createReview = async (req,res) => {
  const {rating,comment} = req.body;
  const value = Number(rating);
  if(!Number.isInteger(value) || value < 1 || value > 5) return res.status(400).json({message:"Rating must be between 1 and 5"});
  const purchased = await Order.exists({customer:req.user._id,status:"Delivered","items.product":req.params.productId});
  if(!purchased) return res.status(403).json({message:"You can review this product after a delivered purchase"});
  const existing = await Review.findOne({customer:req.user._id,product:req.params.productId});
  if(existing) return res.status(400).json({message:"You have already reviewed this product"});
  const review = await Review.create({product:req.params.productId,customer:req.user._id,rating:value,comment:comment?.trim()||"",status:"Pending"});
  res.status(201).json(review);
};
