import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const url = process.env.DB_URL;

export const connectUsingMongoose= ()=>{
    try {
        mongoose.connect(url).then(
            ()=>{
                console.log("Mongodb using Mongoose is connecrted");
            }
        ).catch(err=>console.log(err));
    } catch (err) {
        console.log(err);
    }
}