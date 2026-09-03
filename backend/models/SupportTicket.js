import mongoose from "mongoose";
const schema=new mongoose.Schema({customer:{type:mongoose.Schema.Types.ObjectId,ref:"User"},name:String,email:String,phone:String,subject:{type:String,required:true},message:{type:String,required:true},status:{type:String,enum:["Open","In Progress","Resolved"],default:"Open"},adminReply:{type:String,default:""}}, {timestamps:true});
export default mongoose.model("SupportTicket",schema);
