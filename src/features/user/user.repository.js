import mongoose from "mongoose";
import { userSchema } from "./user.schema.js";
import ApplicationError from "../../error-handler/applicationError.js";

const UserModel = mongoose.model( 'User', userSchema)

export default class UserRepository{
   
    async signUp(user){
        try{
            const newUser= new UserModel(user);
            await newUser.save();
            return newUser;
        }catch(err){
             console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);
        }
    }
   async signIn(email, password) {
           try{
             return await UserModel.findOne({email, password});
         }catch(err){
           console.log(err);
           throw new ApplicationError("Something went wrong with database", 500);
         }
         }

     async findByEmail(email) {
            try{
            return await UserModel.findOne({email});
          }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);
          }
          }
     async resetPassword(userID,newPassword){
        try{
            let user= await UserModel.findById(userID);
            if(user){
                user.password=newPassword;
                await user.save();

            }else{
                throw new Error("User not Found")
            }
        }catch(err){
            console.log(err);
            throw new ApplicationError("Something went wrong with database", 500);
          }
     }  
   

}
