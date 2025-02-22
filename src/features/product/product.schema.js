import mongoose from "mongoose";

export const productSchema= mongoose.Schema(
    {
        name: {type:String},
        price: {type:Number},
        category: {type:String},
        description: {type:String},
        inStock: Number
    }
)