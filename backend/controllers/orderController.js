import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import Setting from "../models/Setting.js";
import { generateOrderId, restoreStockForOrder } from "../utils/order.js";
import { generateInvoicePDF } from "../utils/invoice.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";

const shippingFor = async (city, subtotal) => {
  const s = await Setting.findOne({key:"shipping"});
  const cfg = s?.value || { localCities:["Karachi"], localCharge:200, otherCharge:300, freeAbove:5000 };
  if (subtotal >= (cfg.freeAbove || Infinity)) return 0;
  return (cfg.localCities||[]).map(x=>x.toLowerCase()).includes((city||"").toLowerCase()) ? Number(cfg.localCharge||0) : Number(cfg.otherCharge||0);
};

export const createOrder = async (req,res) => {
  const { items, customerName, phone, email, address, couponCode, paymentMethod="COD" } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({message:"Cart is empty"});
  let subtotal=0, normalized=[];
  for (const item of items) {
    const product=await Product.findById(item.productId);
    if(!product || !product.isActive) return res.status(400).json({message:"One product is unavailable"});
    const variant=product.variants.id(item.variantId);
    if(!variant || variant.stock < Number(item.quantity)) return res.status(400).json({message:`${product.name} selected variant is out of stock`});
    subtotal += product.sellingPrice * Number(item.quantity);
    normalized.push({ product:product._id,name:product.name,image:product.images.find(i=>i.isCover)?.url || product.images[0]?.url,size:variant.size,color:variant.color,quantity:Number(item.quantity),price:product.sellingPrice,variantId:variant._id.toString() });
  }
  let discount=0, coupon=null;
  if(couponCode){
    coupon=await Coupon.findOne({code:couponCode.toUpperCase(),isActive:true});
    if(!coupon || (coupon.expiresAt && coupon.expiresAt<new Date()) || (coupon.maxUses && coupon.usedCount>=coupon.maxUses) || subtotal<coupon.minimumOrder) return res.status(400).json({message:"Invalid or unavailable coupon"});
    if(coupon.type==="percentage") discount=subtotal*coupon.value/100;
    if(coupon.type==="fixed") discount=Math.min(subtotal,coupon.value);
  }
  let shippingAmount=await shippingFor(address?.city,subtotal-discount);
  if(coupon?.type==="free_shipping") shippingAmount=0;
  const totalAmount=Math.max(0,subtotal-discount)+shippingAmount;
  for(const item of normalized){
    const product=await Product.findById(item.product);
    const variant=product.variants.id(item.variantId);
    variant.stock-=item.quantity;
    product.totalSold+=item.quantity;
    await product.save();
  }
  if(coupon){coupon.usedCount+=1;await coupon.save();}
  const order=await Order.create({
    orderId:generateOrderId(),customer:req.user?._id,customerName,phone,email,address,items:normalized,subtotal,discount,shippingAmount,totalAmount,couponCode:coupon?.code,paymentMethod,
    timeline:[{status:"Pending",note:"Order placed successfully"}]
  });
  sendOrderConfirmationEmail(order).catch(()=>{});
  res.status(201).json(order);
};

// Lets the frontend show a live, accurate breakdown (shipping + discount +
// total) on the Checkout page BEFORE the order is placed — same pricing
// logic as createOrder, but read-only: no stock deduction, no coupon
// usage increment.
export const getOrderQuote = async (req,res) => {
  const { items, city, couponCode } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({message:"Cart is empty"});
  let subtotal=0;
  for (const item of items) {
    const product=await Product.findById(item.productId);
    if(!product || !product.isActive) return res.status(400).json({message:"One product is unavailable"});
    const variant=product.variants.id(item.variantId);
    if(!variant) return res.status(400).json({message:`${product.name} selected variant is unavailable`});
    subtotal += product.sellingPrice * Number(item.quantity||1);
  }
  let discount=0, coupon=null, couponMessage="";
  if(couponCode){
    coupon=await Coupon.findOne({code:couponCode.toUpperCase(),isActive:true});
    if(!coupon || (coupon.expiresAt && coupon.expiresAt<new Date()) || (coupon.maxUses && coupon.usedCount>=coupon.maxUses) || subtotal<coupon.minimumOrder){
      couponMessage="This coupon isn't valid for this order";
      coupon=null;
    } else {
      if(coupon.type==="percentage") discount=subtotal*coupon.value/100;
      if(coupon.type==="fixed") discount=Math.min(subtotal,coupon.value);
      couponMessage="Coupon applied";
    }
  }
  let shippingAmount=await shippingFor(city,subtotal-discount);
  if(coupon?.type==="free_shipping") shippingAmount=0;
  const total=Math.max(0,subtotal-discount)+shippingAmount;
  res.json({ subtotal, discount, shippingAmount, total, couponValid: !!coupon, couponMessage });
};

export const getMyOrders = async (req,res) => res.json(await Order.find({customer:req.user._id}).sort({createdAt:-1}));
export const getOrders = async (req,res) => {
  const filter={};
  if(req.query.status) filter.status=req.query.status;
  const orders=await Order.find(filter).populate("customer","name email").sort({createdAt:-1});
  res.json(orders);
};

export const updateOrder = async (req,res) => {
  const order=await Order.findById(req.params.id);
  if(!order) return res.status(404).json({message:"Order not found"});
  const old=order.status;
  ["status","trackingNo","courier","courierNotes","paymentStatus"].forEach(k=>{if(req.body[k]!==undefined)order[k]=req.body[k]});
  if(req.body.status && req.body.status!==old) order.timeline.push({status:req.body.status,note:req.body.note||`Order status updated to ${req.body.status}`});
  if(req.body.status==="Cancelled" && old!=="Cancelled"){
    if(req.body.cancellationReason) order.cancellationReason=req.body.cancellationReason;
    order.cancelledAt=new Date();
    await restoreStockForOrder(order);
  }
  await order.save();
  res.json(order);
};

export const trackOrder = async (req,res) => {
  const q=decodeURIComponent(req.params.query);
  const orders=await Order.find({$or:[{orderId:q},{phone:q}]}).sort({createdAt:-1});
  if(!orders.length) return res.status(404).json({message:"No order found"});
  res.json(orders);
};

export const customerUpdateOrder = async (req,res) => {
  const o = await Order.findOne({_id:req.params.id,customer:req.user._id});
  if(!o) return res.status(404).json({message:"Order not found"});
  if(["Shipped","Out for Delivery","Delivered","Cancelled"].includes(o.status)) return res.status(400).json({message:"This order can no longer be changed"});
  if(req.body.action==="cancel"){
    const reason = String(req.body.reason||"").trim();
    if(!reason) return res.status(400).json({message:"Please select or enter a cancellation reason"});
    o.status="Cancelled";
    o.cancellationReason=reason;
    o.cancelledAt=new Date();
    o.timeline.push({status:"Cancelled",note:`Cancelled by customer: ${reason}`});
    await restoreStockForOrder(o);
  } else if(req.body.address){
    o.address={...o.address.toObject(),...req.body.address};
    o.timeline.push({status:o.status,note:"Delivery address updated by customer"});
  } else {
    return res.status(400).json({message:"Nothing to update"});
  }
  await o.save();
  res.json(o);
};

// Builds the store info block for invoices from the admin-configurable
// "store" setting, with sensible fallbacks so invoices never break if
// the setting hasn't been configured yet.
const storeInfoFor = async () => {
  const s = await Setting.findOne({key:"store"});
  const v = s?.value || {};
  return {
    name: v.name || "Al-Hussaini Garments",
    contact: [v.phone, v.email].filter(Boolean).join(" | "),
    address: v.address || ""
  };
};

export const getMyInvoice = async (req,res) => {
  const order = await Order.findOne({_id:req.params.id, customer:req.user._id});
  if(!order) return res.status(404).json({message:"Order not found"});
  generateInvoicePDF(res, order, await storeInfoFor());
};

export const getInvoice = async (req,res) => {
  const order = await Order.findById(req.params.id);
  if(!order) return res.status(404).json({message:"Order not found"});
  generateInvoicePDF(res, order, await storeInfoFor());
};
