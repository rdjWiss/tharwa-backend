import * as Express from 'express'
import { Userdb } from '../../oauth2Server/models/User';
import { getMessageErreur } from '../../config/errorMsg';

export class GestionBanque{

  //Récupérer la liste des banquiers
  public getListBanquiers:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log('GET /liste banquiers')
    Userdb.findAll({
      where:{
        fonctionId:'B'
      },
      attributes: ['nom','prenom','email','telephone','photo']
    }).then((banquiers:any)=>{
      if(!banquiers){
        res.status(500)
        res.send({
          err:"Erreur",
          code_err:'D09',
          msg_err:getMessageErreur('D09')
        })
      }else{
        res.status(200)
        res.send(banquiers)
      }
    })
  }
  
}