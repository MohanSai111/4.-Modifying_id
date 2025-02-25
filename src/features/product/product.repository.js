import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import mongoose from "mongoose";
import { productSchema } from "./product.schema.js";
import { reviewSchema } from "./review.schema.js";
import { categorySchema } from "./category.schema.js";

const ProductModel= mongoose.model('product',productSchema);
const ReviewModel = mongoose.model('Review',reviewSchema);
const CategoryModel=mongoose.model('Category',categorySchema)
class ProductRepository{

    constructor(){
        this.collection = "products";
    }

    async add(productData){
        try{
           //1.add the product
           productData.categories= productData.category.split(',').map(e=>e.trim());
           console.log(productData);
           const newProduct= new ProductModel(productData);
           const savedProduct=await newProduct.save();
           //2.update the categories
           await CategoryModel.updateMany(
            {_id:{$in:productData.categories}},
            {
                $push:{ products: new ObjectId(savedProduct._id)}
            }

           )
        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);    
        }
    }

    async getAll(){
        try{
            const db = getDB();
            const collection = db.collection(this.collection);
            const products = await collection.find().toArray();
            console.log(products);
            return products;
        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);    
        }
    }

    async get(id){
        try{
            const db = getDB();
            const collection = db.collection(this.collection);
            return await collection.findOne({_id: new ObjectId(id)});
        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);    
        }
    }

    async filter(minPrice, maxPrice, category){
        try{
            const db = getDB();
            const collection = db.collection(this.collection); 
            let filterExpression={};
            if(minPrice){
                filterExpression.price = {$gte: parseFloat(minPrice)}
            }
            if(maxPrice){
                filterExpression.price = {...filterExpression.price, $lte: parseFloat(maxPrice)}
            }
            if(category){
                filterExpression.category=category
            }
            return collection.find(filterExpression).toArray();

        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);    
        }
    }

//     async rate(userID, productID, rating){
//         try{
//             const db = getDB();
//             const collection = db.collection(this.collection); 
//             //1. Find the product
//             const product = await collection.findOne({_id:new ObjectId(productID)});
//             // 2. Find the rating
//             const userRating = product?.ratings?.find(r=> r.userID==userID);
//            if(userRating){
//             // 3. Update the rating
//                 await collection.updateOne({
//                     _id:new ObjectId(productID), "ratings.userID": new ObjectId(userID)
//                 },{
//                     $set:{
//                         "ratings.$.rating":rating
//                     }
//                 })
//            }else{
//             await collection.updateOne({
//                 _id:new ObjectId(productID)
//             },{
//                 $push:{ratings:{userID:new ObjectId(userID), rating}}
//             })
//            }
//         }catch(err){
//             console.log(err);
//             throw new ApplicationError("Something went wrong with database", 500);    
//         }
//     }
// }

async rate(userID, productID, rating){
    try{
       //1.check if product exsists
       const ProductToUpdate= await ProductModel.findById(productID);
       if(!ProductToUpdate){
         throw new Error(" Product not found");
       }
       //2. get the exisisting review
       const userReview= await ReviewModel.findOne({product: new ObjectId(productID),user: new ObjectId(userID)});
       if(userReview){
         userReview.rating= rating;
         await userReview.save();
       }else{
        const newReview = new ReviewModel({
            product: new ObjectId(productID),
            user: new ObjectId(userID),
            rating: rating
        })
        newReview.save();
       }





    }catch(err){
        console.log(err);
        throw new ApplicationError("Something went wrong with database", 500);    
    }
}
   async averageProductPricePerCategory(){
    try{
    const db= getDB();
    return await db.collection(this.collection).
       aggregate([
        {
            //stage 1: get average price per category
            $group:{
                _id:"$category",
                averagePrice:{$avg:"$price"}
            }
        }
       ]).toArray();
    }catch(err){
        console.log(err);
        throw new ApplicationError("Something went wrong with database", 500);    
    }
   }






}

export default ProductRepository;