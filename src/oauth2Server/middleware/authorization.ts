import { Request, Response,RequestHandler, NextFunction } from 'express'
import * as Jwt from '../jwtconf'
import { Userdb } from '../models/User';
import { VerificationToken } from '../models/VerificationToken';
import { getMessageErreur } from '../../config/errorMsg';

const appKeys = [
  {
    name:"Application Mobile",
    client_id:"152"
  },
  {
    name:"Application Web",
    client_id:"541"
  },
  {
    name:"Application Backend",
    client_id:"874"
  }
]


const findClient=function(id: any):boolean{
  return ! appKeys.every(element => {
    return (element.client_id!==id )
  });
}

export const authMiddleware:RequestHandler = function(req,res,next){
  let clientId = req.headers.client_id
  // console.log(clientId)

  if( !clientId ){
    res.status(401)
    res.send({
      err:"Requete Invalide",
      code_err:"A01",
      msg_err:getMessageErreur('A01')
    })
  }else{
    if(!findClient(clientId)){
      res.status(401)
      res.send({
        err:"Client non autorisé",
        code_err:"A02",
        msg_err:getMessageErreur('A02')
      })
    } else {
      // Traitement normal 
      if(clientId == "152") console.log("Connexion : Client Mobile");
      else if(clientId== '541') console.log("Connexion : Client Web")
      else console.log("Connexion : Backend")
      next()
    }
  } 
}

//Vérifier l'expiration du token lors de la connexion
export const expireMiddleware:RequestHandler = function(req,res,next){

  let user = Jwt.decode(req.body.user)
  if(!user){
    res.status(401)
    res.send({
      err:"Requete Invalide",
      code_err:"A03",
      msg_err:getMessageErreur('A03')
    })
  }else{
    var dateNow = new Date();
    // console.log(user);
    if(user.exp < dateNow.getTime()){
      VerificationToken.find({
        where:{
          userdbId: user.id,
          used:-1 
        }
      }).then((result:any) =>{
        result.used = 0;
        result.save();
      })
      res.status(401);
      res.send({
        err:"Accès refusé",
        code_err:"A04",
        msg_err:getMessageErreur('A04')
      })
    }
    else{
      // Ajouter les informations de l'utilisateur pour des utilisations auterieurs;
      req.body.userDecoded=user;
      // console.log("Test append")
      // console.log(req.body)
      next()
    }
  }
   
}

