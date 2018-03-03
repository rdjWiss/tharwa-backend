var oauthServer=require("oauth2-server");
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var randtoken= require('rand-token');
var jwtconf = require('../jwtconf')

import * as Jwt from '../jwtconf'
import * as Express from 'express'


import {Userdb} from '../models/User'
import { SmsController  } from '../../app/controllers/smsController'
import { MailController  } from '../../app/controllers/mailController'
import { VerificationToken } from '../models/VerificationToken';
import { errorMsg } from "../config/authserver";
import { verificationMail,verificationMessage } from '../../config/messages'
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

                var verificationToken= randtoken.generator({
                    chars: '0-9'
                }).generate(8)  
                // A remplacer avec findOrCreate bug anormale 
                  VerificationToken.findOne({
                      where:{
                          userdbId:user.id,
                          used:null
                      }
                  }).then(element =>{
                            if(!element){
                                 // Generation de verification code 
                                   
                                    VerificationToken.create({
                                        userdbId: user.id,
                                        token: verificationToken,

                                    }).then((created)=>{
                                        console.log(created.token)
                                        res.status(200)
                                        res.json({
                                            userId: Jwt.validationReq(user.id,created.token)
                                        })
                                    })
                                }else{
                                    res.status(200)
                                    console.log(element.token)
                                    res.json({
                                        userId: Jwt.validationReq(user.id,element.token)
                                    })
                                    
                                }
                           /*  SmsController.sendSms("Tharwa",user.telephone,
                                                    verificationMessage(element.token,user.nom))
                            MailController.sendMail("TharwaBanque",user.email,"code de vérification"
                                                    ,verificationMail(element.token,user.nom)) */

                         
                            } ) 
                }
            })  
        }    
        
        choisir= function (req:Express.Request,res:Express.Response) {
                const userHash =req.body.user
                const choix= req.body.choix 
                if(!choix || !userHash) {
                    res.status(400);
                    res.send({
                        error: "invalid_request",
                        error_description:"Verifier les champs token et user"
                    })
                }
                else {
                    let user=Jwt.decode(userHash)
                    if(!user) {
                        res.status(400);
                        res.send({
                            error: "access_denied",
                            error_description:"Le Hash de lutilisateur est invalide"
                        })
                    }else{
                        Userdb.findById(user.id)
                              .then(result=>{
                                  console.log(user)
                                if(choix=='SMS'){
                                    console.log('Sending SMS')
                                    
                                    SmsController.sendSms("Tharwa",result.telephone,
                                                            verificationMessage(user.token,result.nom))
                                   
                                }else{
                                    console.log('Sending mail')
                                    MailController.sendMail("TharwaBanque","ed_dahmane@esi.dz","code de vérification"
                                    ,verificationMail(user.token,result.nom)).then(response=>{
                                            res.status(response.status)
                                            console.log(response)
                                    })
                                }
        
                              })    
                        
                    }
                }
        }

        verifyToken= function (req:Express.Request,res:Express.Response){

            const token = req.body.token 
            const user = req.body.user 
            if(!token || !user  ){
                res.status(400);
                res.send({
                    error: "invalid_request",
                    error_description:"Verifier les champs token et user"
                })
            }else{
                let userClair=Jwt.decode(user)
                if(!userClair) {
                    res.status(400);
                    res.send({
                        error: "access_denied",
                        error_description:"Le user Hash est invalide"
                    })
                }
                else{
                    console.log(userClair)
                    VerificationToken.find({
                        where:{
                            userdbId: userClair.id,
                            token : token,
                            used:null
                        }
                    }).then(result =>{
                        if(!result) {
                            res.status(401);
                            res.send({
                                error: "access_denied",
                                error_description:"Le token est invalide"
                            })
                        }else{
                             Userdb.findById(userClair.id)
                                   .then(infoUser=>{
                                       // infoUser.getFonction().then(fonciton=>{
                                            result.used=true
                                            result.save()
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
    }