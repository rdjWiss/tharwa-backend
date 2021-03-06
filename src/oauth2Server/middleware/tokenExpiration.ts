import { Request, Response,RequestHandler, NextFunction } from 'express';
//import * as Jwt from '../../ouath2Server/jwtconf'
import * as Jwt from '../../oauth2Server/jwtconf';
import { getMessageErreur } from '../../config/errorMsg';

//var dateNow = new Date(2018,4,14,21,6,45); possible

export const accessTokenExpireMiddleware:RequestHandler = function(req,res,next){
  let accessToken = Jwt.decode(req.headers.access_token)
  console.log(accessToken)
  if(!accessToken){
    res.status(400)
    res.send({
      err:"Requete Invalide",
      code_err:'A15',
      msg_err:getMessageErreur('A15')
    })
  }else{
    var dateNow = new Date();
    if(tokenExpired(accessToken.exp,dateNow)){
      res.status(401)
      res.send({
        err:"Accès refusé",
        code_err:'A16',
        msg_err:getMessageErreur('A16')
      })
    }
    else{
      req.user= accessToken.id
      console.log('id',req.user)
      next()
    }
  } 
}

export const pinCodeExpireMiddleware:RequestHandler = function(req,res,next){

  let pinCode = Jwt.decode(req.headers.code_pin)
  console.log('code pin',req.headers.code_pin,pinCode)
  if(req.headers.client_id == '152'){
    if(!pinCode){
      res.status(400)
      res.send({
        err:"Requete Invalide",
        code_err:'A15',
        msg_err:getMessageErreur('A15')
      })
    }else{
      var dateNow = new Date();
      if(tokenExpired(pinCode.exp,dateNow)){
        res.status(401)
        res.send({
          err:"Accès refusé",
          code_err:'A17',
          msg_err:getMessageErreur('A17'),
          userId: Jwt.validationReq(req.user)
        })
      }else{
        console.log('code pin ok')
        next()
      }
    } 
  }else{
    next()
  }
  
}

export const refreshTokenExpireMiddleware:RequestHandler = function(req,res,next) {
  let refreshToken = Jwt.decode(req.headers.refresh_token)

  if(!refreshToken){
    res.status(400)
    res.send({
      err:"Requete Invalide",
      code_err:'A15',
      msg_err:getMessageErreur('A15')
    })
  }else{
    var dateNow = new Date();
    if(tokenExpired(refreshToken.exp,dateNow)){
      res.status(401)
      res.send({
        err:"Accès refusé",
        code_err:'A18',
        msg_err:getMessageErreur('A18')
      })
    }else{
      console.log(refreshToken)
      req.body.user=refreshToken.id.id
      console.log('id:',req.body.user)
      next()
    }
  }
}

export const tokenExpired= function(token:any,dateNow:any):boolean{
  console.log(token,dateNow.getTime())
  if (token < dateNow.getTime()) return true
  else return false
}