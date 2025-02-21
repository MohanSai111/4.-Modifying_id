import { ObjectId } from "mongodb";
import { getClient, getDB } from "../../config/mongodb.js";
import OrderModel from "./order.model.js";
import ApplicationError from "../../error-handler/applicationError.js";

export default class OrderRepository{

    constructor(){
        this.collection="orders"
    }

    async placeOrder(userID){
        const client= getClient();
        const session = client.startSession();
        try{
            const db= getDB();
            session.startTransaction();
      //1.get cartITems and calculate total Amount
       const items= await this.getTotalAmount(userID,session);
      const finalTotalAmount= items.reduce((acc,item)=>acc+item.totalAmount,0)
      console.log(finalTotalAmount);

      //2.Create an order record
      const newOrder= new OrderModel(new ObjectId(userID), finalTotalAmount,items);
      await db.collection(this.collection). insertOne(newOrder,{session});

      //3.Reduce the stock
      for(let item of items){
        await db.collection("products").updateOne(
            {_id:item.productID},
            {$inc:{stock: -item.quantity}},{session}
        )
      }
    //   throw new Error("Something is wrong in placeOrder")
      //4.Clear the cartItems
      await db.collection("cartItems").deleteMany({
        userID: new ObjectId(userID)
      },{session});
      session.commitTransaction();
      session.endSession();
      return;
        }catch(err){
            await session.abortTransaction();
            session.endSession();
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);
        }
    }



    async getTotalAmount(userID,session){
        
        const db= getDB();
       const items=await db.collection("cartItems").aggregate([
          //1.get cart items for the user
          {
          $match:{userID:new ObjectId(userID)}
          },
          //2.get products from products collection
          {
            $lookup:{
                from:"products",
                localField:"productID",
                foreignField:"_id",
                as:"productInfo"
            }
          },
          //3.UnWind the productInfo.
          {
            $unwind:"$productInfo"
          },
          //4.caluculate the total amountfor each cartItems.
          {
            $addFields:{
                "totalAmount":{
                    $multiply:[
                        { $toDouble: "$productInfo.price" },
                        { $toInt: "$quantity" }
                    ]
                }
            }
          }

        ],{session}).toArray();
        return items;
    }
}
