import * as Jwt from '../jwtconf'
import * as Express from 'express'
import { Userdb } from '../models/User';
import { getMessageErreur } from '../../config/errorMsg';
import { SmsController } from '../../app/controllers/smsController';
import { VerificationToken } from '../models/VerificationToken';
import { verificationMessage, verificationMail } from '../../config/messages';
import { MailController } from '../../app/controllers/mailController';
var randtoken= require('rand-token');

export class RefreshTokens{

  public refreshAccessToken:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log('/refresh-access')

    let user = req.body.user

    Userdb.findOne({
      where:{
        id:user
      }
    }).then((found:any)=>{
      if(!found){
        res.status(400)
        res.send({
          err:"Accès refusé",
          code_err:'U03',
          msg_err:getMessageErreur('U03')
        })
      }else{
        res.status(200)
        res.send({
          access_token:Jwt.genAccessToken(user)
        })
      }
    })
  }

  public refreshPinChoisir= function (req:Express.Request,res:Express.Response) {
    console.log("/choisir");
    
    // const user =req.body.user
    let choix= req.body.choix 

    let token = Jwt.decode(req.body.access_token)
    if(!token){
      res.status(401);
      res.send({
        err: "Access Denied",
        code_err:"A10",
        msg_err:getMessageErreur('A10')
      })
    }else{
      if(!choix) {
        res.status(400);
        res.send({
          err: "Invalid Request",
          code_err:"A07",
          msg_err:getMessageErreur('A07')
        })
      }else {
        var verificationToken:string;
        verificationToken= randtoken.generator({
          chars: '0-9'
        }).generate(4)  
        console.log(verificationToken); 
    
        VerificationToken.create({
          userdbId: token.id,
          token: verificationToken,
          attempts:0,
          used:-1, //A utiliser
          expire: token.exp
        }).then((user:any)=>{
          // console.log(user.dataValues)
        })
        
        Userdb.findById(token.id)
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
                Message: "Mail sent "+verificationToken,
                code:verificationToken
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
      }
    }
    
  }
}