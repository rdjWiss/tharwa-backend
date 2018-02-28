var oauthServer=require("oauth2-server");
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var randtoken= require('rand-token');

import * as Express from 'express'

import {Userdb} from '../app/models/User'
import { SmsController  } from '../app/controllers/smsController'
import { MailController  } from '../app/controllers/mailController'
import { VerificationToken } from '../app/models/VerificationToken';

export class OAuthnetification{
    



    login(req:Express.Request,res:Express.Response,next:any){
        VerificationToken.sync({
            force:true
          })
          
        Userdb.findOne({
            where: {
                'email':req.body.email,
                'password': req.body.password
            }
        }).then( user =>{
            console.log("user:")
            if(!user){
                res.status(403);
                res.send("Bad Credentials")     
            }
            else{
                // Generation de verification code 
                const verificationToken= randtoken.generator({
                    chars: '0-9'
                  }).generate(8);
              /*    VerificationToken.findOrCreate({
                      where:{
                          userId:user.id
                      }
                  }).then(oldtoken=>{
                      console.log("old token ")
                      console.log(oldtoken)
                  })*/
            /*   console.log(verificationToken)
                        // Envoi 
                        SmsController.sendSms('djamel',213672478479
                        ,'Vous avez demande de vous connecter voici le code :'
                        +verificationToken
                        )*/
                MailController.sendMail("Tharwa@tharwa.dz","ed_dahmane@esi.dz",
                                        "Authentification",
                                         "Azul Voici le code "+verificationToken)
                                         .then(response=>{
                                             console.log(response)
                                         })
                                        
                     //   res.redirect(301,"Go validate your connection");
                     res.status(200);
                     res.send("Go validate your token")
            }
        } )

    
    }
}