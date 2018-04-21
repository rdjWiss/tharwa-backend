import { Request, Response,RequestHandler, NextFunction } from 'express';
//import * as Jwt from '../../ouath2Server/jwtconf'
import * as Jwt from '../../oauth2Server/jwtconf';

//var dateNow = new Date(2018,4,14,21,6,45); possible

export const TokensExpireMiddleware:RequestHandler = function(req,res,next){

  let verifToken = Jwt.decode(req.body.verification_token)
  let accessToken = Jwt.decode(req.body.access_token)
  let refreshToken = Jwt.decode(req.body.refresh_token)

  if(!verifToken || !accessToken || !refreshToken){
    res.status(400)
    res.send({
      error:"Requete Invalide",
      error_description:"Verifier les champs des tokens"
    })
  }else{
    var dateNow = new Date();
    console.log(verifToken.exp)
    console.log(dateNow.getTime())
    if(verifToken.exp < dateNow.getTime()){
      console.log('Verification token expired')
      if(accessToken.exp < dateNow.getTime() ){
        console.log('Access token expired')
        if(refreshToken.exp < dateNow.getTime() ){
          console.log('Refresh token expired')
          res.status(401)
          res.send({
            error: "Accès refusé",
            error_description:"Tous les tokens ont expiré."
          })
        }
        else {next() }
      }
      else {next() }
    }
    else{
      next()
    }
  }
   
}
