var oauthServer=require("oauth2-server");
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var randtoken= require('rand-token');
import * as Jwt from './jwtconf'
import * as Express from 'express'

import {Userdb} from '../app/models/User'
import { SmsController  } from '../app/controllers/smsController'
import { MailController  } from '../app/controllers/mailController'
import { VerificationToken } from '../app/models/VerificationToken';
import { errorMsg } from "./authserver";
export class OAuthnetification{
    



    login:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
      
          
        Userdb.findOne({
            where: {
                'email':req.body.email,
                'password': req.body.password
            }
        }).then( user =>{
            if(!user){
                res.status(401);
                res.send("Bad Credentials")     
            }
            else{
                // Generation de verification code 
                const verificationToken= randtoken.generator({
                    chars: '0-9'
                  }).generate(8);
                  VerificationToken.findOrCreate({
                      where:{
                          userdbId:user.id,
                          used:null
                      },
                      default:{
                         token:'111111'
                      },
                  }).spread((token,created)=>{
                    
                  })
            /*   console.log(verificationToken)
                        // Envoi 
                        SmsController.sendSms('djamel',213672478479
                        ,'Vous avez demande de vous connecter voici le code :'
                        +verificationToken
                        )*/
                MailController.sendMail("Tharwa@tharwa.dz","ed_dahmane@esi.dz",
                                        "Authentification",
                                         "Azul Voici le code "+verificationToken)
                                         .then( reponse=>{                                             
                                            res.status(200);
                                            console.log("Test")
                                            res.send({
                                               status : reponse[0].statusCode
                                         })
                                        
                     //   res.redirect(301,"Go validate your connection");
                     
            }
        } )

    
    }

    verifyToken(req:Express.Request,res:Express.Response){
            const token = req.body.token 
            const user = req.body.user 

            if(!token || !user  ){
                res.status(401);
                res.send({
                    error: "invalid_request",
                    error_description:"Verifier les champs token et user"
                })
            }else{
                VerificationToken.find({
                    where:{
                        userdbId: user,
                        token : token
                    }
                }).then(result =>{
                    if(!result) {
                        res.status(401);
                        res.send("dfgdfg")
                    }else{
                         Userdb.findById(user)
                               .then(infoUser=>{
                                   // infoUser.getFonction().then(fonciton=>{
                                        const auth=Jwt.genToken(infoUser,"banquier")
                                        res.status(200)
                                        res.send(auth); 
                                 //   })
                                
                                    

                               })

                    }
                })

            }
    }
}