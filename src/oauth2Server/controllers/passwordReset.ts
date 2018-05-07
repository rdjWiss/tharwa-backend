import { Userdb } from "../models/User";
import { errorMsg } from "../config/authserver";
import { Request, Response } from 'express'
import { PasswordResetToken } from "../models/PasswordReset";


var randtoken= require('rand-token');



export class PasswordResetController{

    askReset( req:Request , res:Response ){

            let email=req.body.email
            Userdb.findOne(
                {
                    where: {
                        email:email
                    }
                }
            ).then((user:any)=>{
                    if(!user) {
                        res.status(400)
                        res.json(errorMsg('access_denied',"cet adresse email est introuvable"))
                    }else{
                        var resetToken= randtoken.generator({
                            chars: '0-9-a-z-A-Z'
                        }).generate(12)  
                        PasswordResetToken.create({
                            userdbId: user.id,
                            token:resetToken,
                        }).then(()=>{
                            console.log(resetToken)
                            console.log("Envoi par mail ")
                        })

                    }
            })
    }

}