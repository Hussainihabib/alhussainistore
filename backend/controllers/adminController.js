import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import ReturnRequest from "../models/ReturnRequest.js";
import Review from "../models/Review.js";
import Banner from "../models/Banner.js";
import Setting from "../models/Setting.js";
import User from "../models/User.js";
import SupportTicket from "../models/SupportTicket.js";
import Newsletter from "../models/Newsletter.js";
import { recalculateProductRating } from "../utils/review.js";

export const dashboard = async (req,res) => {
  const [orders, products, lowStock, returnsPending, totalCustomers] = await Promise.all([
    Order.find().populate("customer","name"), Product.countDocuments(), Product.find().then(ps=>ps.filter(p=>p.totalStock<=5).length),
    ReturnRequest.countDocuments({status:"Pending"}), User.countDocuments({role:"customer"})
  ]);
  const revenue=orders.filter(o=>o.status==="Delivered").reduce((s,o)=>s+o.totalAmount,0);
  const profit=0;
  const statusCounts=["Pending","Confirmed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"].map(status=>({status,count:orders.filter(o=>o.status===status).length}));

  const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
  const todaySales = orders.filter(o=>o.status!=="Cancelled" && o.createdAt>=startOfToday).reduce((s,o)=>s+o.totalAmount,0);
  const monthRevenue = orders.filter(o=>o.status!=="Cancelled" && o.createdAt>=startOfMonth).reduce((s,o)=>s+o.totalAmount,0);

  const days={};
  orders.forEach(o=>{const d=o.createdAt.toISOString().slice(0,10);days[d]=(days[d]||0)+o.totalAmount});
  const sales=Object.entries(days).slice(-30).map(([date,revenue])=>({date,revenue}));

  const monthlyOrdersMap={};
  orders.forEach(o=>{const m=o.createdAt.toISOString().slice(0,7);monthlyOrdersMap[m]=(monthlyOrdersMap[m]||0)+1});
  const monthlyOrders=Object.entries(monthlyOrdersMap).sort().slice(-12).map(([month,count])=>({month,count}));

  const topProducts=await Product.find().sort({totalSold:-1}).limit(5).select("name totalSold sellingPrice images category").populate("category","name");

  const categoryMap={};
  (await Product.find().populate("category","name")).forEach(p=>{
    const name=p.category?.name||"Uncategorized";
    categoryMap[name]=(categoryMap[name]||0)+(Number(p.totalSold)||0);
  });
  const categoryPerformance=Object.entries(categoryMap).map(([category,unitsSold])=>({category,unitsSold})).sort((a,b)=>b.unitsSold-a.unitsSold).slice(0,8);

  res.json({
    cards:{
      revenue,todaySales,monthRevenue,
      totalOrders:orders.length,
      pending:statusCounts.find(x=>x.status==="Pending")?.count||0,
      delivered:statusCounts.find(x=>x.status==="Delivered")?.count||0,
      cancelled:statusCounts.find(x=>x.status==="Cancelled")?.count||0,
      products,lowStock,returnsPending,profit,totalCustomers
    },
    statusCounts,sales,monthlyOrders,topProducts,categoryPerformance,recentOrders:orders.slice(-8).reverse()
  });
};

export const getInventory = async (req,res) => {
  const products=await Product.find().populate("category");
  res.json(products.map(p=>({id:p._id,name:p.name,category:p.category?.name,totalStock:p.totalStock,variants:p.variants,low:p.totalStock<=5})));
};

export const getCoupons = async (req,res)=>res.json(await Coupon.find().sort({createdAt:-1}));
export const saveCoupon = async (req,res)=>{
  if(req.params.id) return res.json(await Coupon.findByIdAndUpdate(req.params.id,req.body,{new:true}));
  res.status(201).json(await Coupon.create(req.body));
};
export const deleteCoupon = async(req,res)=>{await Coupon.findByIdAndDelete(req.params.id);res.json({message:"Deleted"});};

export const getBanners = async(req,res)=>res.json(await Banner.find().sort({sortOrder:1}));
export const saveBanner = async(req,res)=> req.params.id ? res.json(await Banner.findByIdAndUpdate(req.params.id,req.body,{new:true})) : res.status(201).json(await Banner.create(req.body));
export const deleteBanner = async(req,res)=>{await Banner.findByIdAndDelete(req.params.id);res.json({message:"Deleted"});};

export const getSettings = async(req,res)=>{
 const rows=await Setting.find();res.json(Object.fromEntries(rows.map(x=>[x.key,x.value])));
};
export const saveSettings = async(req,res)=>{
 for(const [key,value] of Object.entries(req.body)) await Setting.findOneAndUpdate({key},{value},{upsert:true,new:true});
 res.json({message:"Settings saved"});
};

export const getReturns = async(req,res)=>res.json(await ReturnRequest.find().populate("order customer","orderId customerName name email").sort({createdAt:-1}));
export const updateReturn = async(req,res)=>res.json(await ReturnRequest.findByIdAndUpdate(req.params.id,req.body,{new:true}));

export const getReviews = async(req,res)=>res.json(await Review.find().populate("product customer","name images name").sort({createdAt:-1}));
export const updateReview = async(req,res)=>{
  const review = await Review.findByIdAndUpdate(req.params.id,req.body,{new:true});
  if(!review) return res.status(404).json({message:"Review not found"});
  await recalculateProductRating(review.product);
  res.json(review);
};
export const deleteReview = async(req,res)=>{
  const review = await Review.findByIdAndDelete(req.params.id);
  if(review) await recalculateProductRating(review.product);
  res.json({message:"Deleted"});
};

export const getNewsletterSubscribers = async(req,res)=>res.json(await Newsletter.find().sort({createdAt:-1}));
export const deleteNewsletterSubscriber = async(req,res)=>{await Newsletter.findByIdAndDelete(req.params.id);res.json({message:"Deleted"});};
export const toggleNewsletterSubscriber = async(req,res)=>{
  const sub=await Newsletter.findById(req.params.id);
  if(!sub) return res.status(404).json({message:"Subscriber not found"});
  sub.status = sub.status==="Active" ? "Inactive" : "Active";
  await sub.save();
  res.json(sub);
};

export const getUsers = async (req,res) => {
  const users = await User.find({role:"customer"}).select("-password").sort({createdAt:-1});
  const stats = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    { $group: {
        _id: "$customer",
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        lastOrderDate: { $max: "$createdAt" }
      }
    }
  ]);
  const statsById = Object.fromEntries(stats.map(s => [String(s._id), s]));
  res.json(users.map(u => {
    const s = statsById[String(u._id)];
    return {
      ...u.toObject(),
      totalOrders: s?.totalOrders || 0,
      totalSpent: s?.totalSpent || 0,
      lastOrderDate: s?.lastOrderDate || null
    };
  }));
};
export const toggleUser=async(req,res)=>{const u=await User.findById(req.params.id);if(!u)return res.status(404).json({message:"User not found"});u.isActive=!u.isActive;await u.save();res.json(u);};
export const getSupportTickets=async(req,res)=>res.json(await SupportTicket.find().populate("customer","name email").sort({createdAt:-1}));
export const updateSupportTicket=async(req,res)=>{const t=await SupportTicket.findByIdAndUpdate(req.params.id,req.body,{new:true});if(!t)return res.status(404).json({message:"Ticket not found"});res.json(t);};
