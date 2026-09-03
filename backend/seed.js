import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Setting from "./models/Setting.js";

await connectDB();
const adminEmail="admin@ahg.com";
let admin=await User.findOne({email:adminEmail});
if(!admin){await User.create({name:"Store Admin",email:adminEmail,password:"Ahg@404!",role:"admin"});console.log("Admin created");}
const names=["Boys","Girls"];
for(const name of names){
 const slug=name.toLowerCase();
 if(!await Category.findOne({slug})) await Category.create({name,slug,description:`${name} collection`});
}
await Setting.findOneAndUpdate({key:"shipping"},{value:{localCities:["Karachi"],localCharge:200,otherCharge:300,freeAbove:5000}},{upsert:true});
await Setting.findOneAndUpdate({key:"store"},{value:{storeName:"Al-Hussaini Garments",whatsapp:"923001234567",email:"info@example.com",currency:"PKR"}},{upsert:true});
console.log("Seed complete");
process.exit(0);
