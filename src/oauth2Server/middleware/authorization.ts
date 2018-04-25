import { Request, Response,RequestHandler, NextFunction } from 'express'
import * as Jwt from '../jwtconf'
import { Userdb } from '../models/User';
import { VerificationToken } from '../models/VerificationToken';

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

  //console.log(req.headers);
  //console.log(req.body);

  let clientId = req.headers.client_id

  if( !clientId ){
    res.status(401)
    res.send({
      error:"Requete Invalide",
      error_description:"verifier les champs clientId"
    })
  }else{
    if(!findClient(clientId)){
      res.status(401)
      res.send({
        error:"Client non autorisé",
        error_description:"L'application n'est pas authorisée"
      })
    } else {
      // Traitement normal 
      if(clientId == "152") console.log("Connexion : Client Mobile");
      else console.log("Connexion : Client Web")
      next()
    }
  } 
}

export const expireMiddleware:RequestHandler = function(req,res,next){

  let user = Jwt.decode(req.body.user)
  if(!user){
    res.status(401)
    res.send({
      error:"Requete Invalide",
      error_description:"verifier le champ user"
    })
  }else{
    var dateNow = new Date();
    console.log(user);
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
      res.status(410);
      res.send({
        message: "Votre token a expiré"
      })
    }
    else{
      // Ajouter les informations de l'utilisateur pour des utilisations auterieurs;
      req.body.userDecoded=user;
      console.log("Test append")
      console.log(req.body)
      next()
    }
  }
   
}

