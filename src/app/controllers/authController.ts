import { Response,Request, NextFunction } from "express";
import { Userdb } from "../models/User";


export function loginController(req:Request,res:Response,next:NextFunction){
    
    let mail=req.body.email 
    let pass = req.body.password    
    console.log(req);
    if(!mail || !pass ) {
        res.status(400)
        res.json(req.body);
    }
    else {
       const user= Userdb.findOne().get()

       if(!user){
           res.status(400);
           res.send("Nom d'utilisateur ou mot de passe incorrecte ");   
       }
       else{
            // L'utilisateur est connecté 


       }
    }

}

export function getAuthToken(req: Request,res:Response){
    
}

