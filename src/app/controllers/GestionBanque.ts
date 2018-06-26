import * as Express from 'express'
import { Userdb } from '../../oauth2Server/models/User';
import { getMessageErreur } from '../../config/errorMsg';
import { Banque } from '../models/Banque';
import { Sequelize } from '../../config/db';
import { logger } from '../../config/logger';

export class GestionBanque{

  //Récupérer la liste des banquiers
  public getListBanquiers:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    logger.taglog("info","Récupération de la liste des banquiers",'',['Gestionnaire','Banquiers'])
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

  //CRUD Banque
  public ajouterBanque:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log('add banque')
    let codeBanque= req.body.code_banque
    let nom= req.body.nom
    let adresse= req.body.adresse
    let email= req.body.email
    let raisonSociale= req.body.raison_sociale

    if(!codeBanque || !nom || !email || !adresse || !raisonSociale ){
      res.status(400);
      res.send({
        err:"Bad request",
        code_err:'B01',
        msg_err:getMessageErreur('B01')
      })
    }else{
      Banque.create({
        code_banque : codeBanque,
        nom: nom,
        adresse: adresse,
        email: email,
        raison_sociale:raisonSociale
      }).then((created:any)=>{
        res.status(200)
        res.send(created)
      })
      .catch(Sequelize.ValidationError,function(err:any){
        console.log('Erreur de validation des champs lors de la création de la banque')
        let champErr = err.errors[0].path
        res.status(400);
        res.send({
          err:"Bad request",
          code_err:'B02',
          msg_err:getMessageErreur('B02')+champErr
        })
      })
      .catch(function(err:any){
        console.log('Banque existe')
        res.status(400)
        res.send({
          err:"Bad request",
          code_err:'B03',
          msg_err:getMessageErreur('B03')
        })
      })
    }
  }

  public modifierBanque:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log('modifier banque')
    let codeBanque= req.params.codeBanque
    let nom= req.body.nom
    let adresse= req.body.adresse
    let email= req.body.email
    let raisonSociale= req.body.raison_sociale

    Banque.findOne({
      where:{ code_banque : codeBanque}
    }).then((banque:any)=>{
      if(!banque){
        res.status(400)
        res.send({
          err:"Erreur",
          code_err:'B05',
          msg_err:getMessageErreur('B05')+codeBanque
        })
      }else{
        banque.update({
          code_banque:codeBanque || banque.code_banque,
          nom: nom || banque.nom,
          email: email || banque.email,
          adresse: adresse || banque.adresse,
          raison_sociale: raisonSociale || banque.raison_sociale
        }).then((updated:any)=>{
          if(!updated){
            res.status(500)
            res.send({
              err:"Erreur",
              code_err:'B06',
              msg_err:getMessageErreur('B06')+codeBanque
            })
          }else{
            res.status(200)
            res.send(updated)
          }
        })
      }
    })
  }

  public supprimerBanque:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log('supprimer banque')
    let codeBanque= req.params.codeBanque

    Banque.findOne({
      where:{
        code_banque:codeBanque
      }
    }).then((found:any)=>{
      if(!found){
        res.status(400)
        res.send({
          err:"Erreur",
          code_err:'B05',
          msg_err:getMessageErreur('B05')+codeBanque
        })
      }else{
        found.destroy()
        res.status(200)
        res.send(found)
      }
    })
  }

  public getListBanques:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    
    Banque.findAll()
    .then((banques:any)=>{
      if(!banques){
        res.status(500)
        res.send({
          err:"Erreur",
          code_err:'B04',
          msg_err:getMessageErreur('B04')
        })
      }else{
        res.status(200)
        res.send(banques)
      }
    }) 
  }
  
}