var oauthServer=require("oauth2-server");
var Request = oauthServer.Request;
var Response = oauthServer.Response;
var randtoken= require('rand-token');
var jwtconf = require('../jwtconf')
var crypto = require('crypto')

import * as Jwt from '../jwtconf'
import * as Express from 'express'


import {Userdb} from '../models/User'
import { SmsController  } from '../../app/controllers/smsController'
import { MailController  } from '../../app/controllers/mailController'
import { VerificationToken } from '../models/VerificationToken';
import { errorMsg } from "../config/authserver";
import { verificationMail,verificationMessage } from '../../config/messages'
import { Compte } from '../../app/models/Compte';
import { getMessageErreur } from '../../config/errorMsg';
export class OAuthnetification{
    

login:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
  console.log("/login");

  var cleApp = req.headers.client_id
  var fct ;
  //Vérifier la fonction du user
  //Seuls les clients et Employeurs peuvent utiliser l'application mobile
  //Et seuls les gestionnaires et banquiers l'application web
  if(cleApp=="152") fct = ["C","E"]
  else fct = ["G","B"]
  let mdpCrypte = crypto.createHash('md5').update(req.body.password).digest('hex')
  
  Userdb.findOne({
    where: {
      'email':req.body.email,
      'password': mdpCrypte,
      'fonctionId':{
        $or: fct
      },
      
    }
  }).then( (user:any) =>{
    if(!user){
      res.status(401);
      res.send({
        err: "Bad Credentials",
        code_err:"A05",
        msg_err:getMessageErreur('A05')
      })     
    }else{
      if(user.active == "FALSE"){
        res.status(401);
        res.send({
          err: "Accès non autorisé",
          code_err:"A06",
          msg_err:getMessageErreur('A06')
        })  
      }else{
        res.status(200)
        res.json({
        userId: Jwt.validationReq(user.id)
      })
      }
      
    }
  })  
}    
    
choisir= function (req:Express.Request,res:Express.Response) {
  console.log("/choisir");
  
  const userHash =req.body.user
  const choix= req.body.choix 
  //Si la requete ne contient pas de choix ou de userHash
  if(!choix || !userHash) {
    res.status(400);
    res.send({
      err: "Invalid Request",
      code_err:"A07",
      msg_err:getMessageErreur('A07')
    })
  }else {
    let user=Jwt.decode(userHash)
    //Si on ne peut pas décoder, on obtient null
    if(!user) {
      res.status(401);
      res.send({
        err: "Access Denied",
        code_err:"A10",
        msg_err:getMessageErreur('A10')
      })
    }else{//Sinon
      var verificationToken:string;
      VerificationToken.find({
        where:{
          userdbId: user.id,
          //used:-1 //Not used
        }
      }).then((result:any) =>{
        if(result){
          //Si token non utilisé, l'utiliser
          if(result.used == -1 && result.attempts >= 3){
            verificationToken = result.token
            // console.log(verificationToken);
          }else{
            //Génération d'un nouveau code de vérification
            verificationToken= randtoken.generator({
              chars: '0-9'
            }).generate(4)  
            // console.log(verificationToken); 
          }
          
          result.token=verificationToken;
          result.attempts=0;
          result.used=-1;
          result.expire= user.exp;
          result.save()

        }else{
          verificationToken= randtoken.generator({
            chars: '0-9'
          }).generate(4)  
          console.log(verificationToken); 

          VerificationToken.create({
            userdbId: user.id,
            token: verificationToken,
            attempts:0,
            used:-1, //A utiliser
            expire: user.exp
          })
        }

        Userdb.findById(user.id)
        .then((result:any)=>{
          if(choix=='SMS'){
            SmsController.sendSms("Tharwa",result.telephone,
                  verificationMessage(verificationToken,result.nom))  
            console.log('Sending SMS')
            res.status(200)
            res.send({
                Message: "SMS sent"
            })
                                  
          }else if(choix=='MAIL'){
            MailController
            .sendMail(result.email,"Code de vérification",
              verificationMail(verificationToken,result.nom))
            res.status(200)
            res.send({
                Message: "Mail sent"+verificationToken
            })
          }
          else{
              res.status(400)
              res.send({
                err: "Requete invalide",
                code_err:"A08",
                msg_err:getMessageErreur('A08')
              })
          }
        })
      });  
    }
  }
}

verifyToken= function (req:Express.Request,res:Express.Response){
  console.log("/vérifier");
  const token = req.body.token //Code de vérification
  const user = req.body.user //token de vérification

  if(!token || !user  ){
    res.status(400);
    res.send({
    err: "Requete invalide",
    code_err:"A09",
    msg_err:getMessageErreur('A09')
    })
  }else{
    let userClair=Jwt.decode(user)
    if(!userClair) {
      res.status(401);
      res.send({
        err: "Accès refusé",
        code_err:"A10",
        msg_err:getMessageErreur('A10')
      })
    }else{
      // console.log(userClair)
      VerificationToken.find({
        where:{
          userdbId: userClair.id,
          //token : token,
          used:-1 //Not used
        }
      }).then((result:any) =>{
        var dateNow = new Date();
        if(!result) {
          res.status(401);
          res.send({
            err: "Accès refusé",
            code_err:"A10",
            msg_err:getMessageErreur('A10')
          })
        }else if(result.expire < dateNow.getTime()){
          result.used=0;
          result.save()
          res.status(401);
          res.send({
            err: "Accès refusé",
            code_err:"A04",
            msg_err:getMessageErreur('A04')
          })
        }else if(result.token != token){
          var retour ={
            err: "Accès refusé",
            code_err:"",
            msg_err:""
          }

          //console.log(token);
          // console.log(result.attempts);
          result.attempts=result.attempts+1
          
          if(result.attempts == 3){
            result.used=0 //Le token n'a pas été utilisé mais a dépassé les attempts
            //Ne peut plus etre utilisé
            retour.code_err = 'A14'
            retour.msg_err = getMessageErreur('A14');
          }
          else {
            retour.code_err = 'A11'
            retour.msg_err = getMessageErreur('A11');
          }
          result.save()
          res.status(401);
          res.send(retour);
        }else{
          if(result.attempts==3){
            res.status(401);
            res.send({
              err: "Accès refusé",
              code_err:"A12",
              msg_err:getMessageErreur('A12')
            })
          }else{
            
              Userdb.findOne({
                where:{id:userClair.id},
                attributes: ['id', 'nom', 'prenom', 'photo','email','fonctionId']
              }).then((infoUser:any)=>{
                result.used=1
                result.attempts=result.attempts+1
                result.save()
                Jwt.genToken(infoUser,infoUser.fonctionId, result.token,function(auth:any){
                  //const auth=Jwt.genToken(infoUser,infoUser.fonctionId, result.token)
                  console.log("Logged In")

                  Compte.findAll({
                    where:{
                      id_user:infoUser.id,
                    },attributes:['num_compte','balance','date_creation', 
                      'type_compte','code_monnaie','statut_actuel']
                  }).then((comptes:any)=>{
                    auth.comptes = comptes
                    res.status(200)
                    res.send(auth); 
                  })
                },(error:any)=>{
                  res.status(500);
                  res.send({
                    err: "Erreur Serveur",
                    code_err:error,
                    msg_err:getMessageErreur(error)
                  })
                })
              })
            }
          }
        })
      }
    }
  }
}