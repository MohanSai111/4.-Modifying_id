import { LikeRepository } from "./like.repository.js";

export default class LikeController{
    constructor(){
        this.likeRepository= new LikeRepository();
    }

async likeItem(req,res,next){
    try{
        const{id,type}=req.body;
        const userID= req.userID;
        if(type!='Product'&&type!='Category'){
            return res.status.send(400).send('Inavalid Type');
        }
if(type === 'Product'){

            await this.likeRepository.likeProduct(userID,id);
        }else{
            await this.likeRepository.likeCategory(userID,id);
        }
        return res.status(200).send();
    }catch(err){
        console.log(err);
        return res.status(200).send("Something went wrong");
      }
}

async getLikes(req,res,next){
    try{
        const{id,type}= req.query;
        const likes= await this.likeRepository.getLikes(type,id);
        return res.status(200).send(likes);

    }catch(err){
        console.log(err);
        return res.status(200).send("Something went wrong");
      }
}

}
