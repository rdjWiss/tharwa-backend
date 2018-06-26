import { Request, Response,RequestHandler, NextFunction } from 'express';
import { getMessageErreur } from '../../config/errorMsg';

export const WebMiddleware:RequestHandler = function(req,res,next){

  var clientId = req.headers.client_id;
  if(clientId != "541"){
    res.status(401)
    res.send({
      error:"Requete non autorisée",
      code_err:"A02",
      msg_err:getMessageErreur('A02')
    })
  }else{
    next()
  }
  //Sinon vérifier pour chaque cas: 
  //Y a des fonctions de banquiers, d'autres pour gestionnaires
}

export const MobMiddleware:RequestHandler = function(req,res,next){

  var clientId = req.headers.client_id;
  if(clientId != "152"){
    res.status(401)
    res.send({
      error:"Requete non autorisée",
      code_err:"A02",
      msg_err:getMessageErreur('A02')
    })
  }else{
    next()
  }
  //Sinon vérifier pour chaque cas: 
  //Y a des fonctions de banquiers, d'autres pour gestionnaires
}