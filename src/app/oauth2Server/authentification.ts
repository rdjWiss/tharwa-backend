var oauthServer=require("oauth2-server");
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var randtoken= require('rand-token');

import * as Express from 'express'

import {Userdb} from '../models/User'
import { SmsController  } from '../controllers/smsController'
import { MailController  } from '../controllers/mailController'

export class OAuthnetification{
    



    login(req:Express.Request,res:Express.Response,next:any){
    
        Userdb.findOne({
            where: {
                'email':req.body.email,
                'password': req.body.password
            }
        }).then( user =>{
            console.log("user:")
            console.log(user.get());
            if(!user){
                res.status(403);
                res.send("Bad Credentials")     
            }
            else{
                // Generation de verification code 
                const verificationToken= randtoken.generator({
                    chars: '0-9'
                  }).generate(8);
                console.log(verificationToken)
                        // Envoi 
                    /*    SmsController.sendSms('djamel',213672478479
                        ,'Vous avez demande de vous connecter voici le code :'
                        +verificationToken
                        )*/
                MailController.sendMail("Tharwa@tharwa.dz","ed_dahmane@esi.dz",
            "Authentification",
        "Azul Voici le code "+verificationToken);

            }
        } )
    
    }
}