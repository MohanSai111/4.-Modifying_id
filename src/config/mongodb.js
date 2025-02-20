
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DB_URL;
console.log("URL: "+url);

let client;
export const connectToMongoDB = ()=>{
    MongoClient.connect(url)
        .then(clientInstance=>{
            client=clientInstance
            console.log("Mongodb is connected");
            createCounter(client.db());
        })
        .catch(err=>{
            console.log(err);
        })
}

export const getDB = ()=>{
    return client.db();
}

const createCounter = async(db)=>{
    const existingCounter=await db.collection("counters").findOne({_id:'cartItemId'});
    if(!existingCounter){
        await db.collection("counters").insertOne({_id:'cartItemId', value:0});
    }
}
