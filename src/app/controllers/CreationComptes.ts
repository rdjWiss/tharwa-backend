import * as Express from 'express'
import {Userdb} from '../../oauth2Server/models/User'
import {Fonction} from '../../oauth2Server/models/Fonction'
import {Compte} from '../../app/models/Compte'
import { AvoirStatut } from '../models/AvoirStatut';
import {Parametre, NUM_SEQ_COMPTE} from '../models/Parametre'
import {Monnaie, monnaies} from '../models/Monnaie'
import {TypeCompte, typeComptes, COMPTE_COURANT, COMPTE_EPARGNE, COMPTE_DEVISE} from '../models/TypeCompte'

import {GestionComptes} from './GestionComptes'
import { type } from 'os';
import { MailController } from './mailController';
import { creationCompteUserBanquierMail, creationCompteUserClientMail, nouvelleDemandeCreationCompteNotifBanquier } from '../../config/messages';
import { Sequelize } from '../../config/db';
import { getMessageErreur } from '../../config/errorMsg';
import { logger } from '../../config/logger';

var crypto = require('crypto')
var base64 = require('node-base64-image')

const gestionComptes = new GestionComptes();

export class CreationComptes{

  image:Express.RequestHandler=function(req:Express.Request,res:Express.Response,next:any){
    console.log('/IMAGE')
    var photo = null
    var filnamePath = "./"
    var filename = "assets/images/image"
    //console.log(filename);
    // console.log(req.body.photo)
    if (req.body.photo != null) {
      base64.decode(new Buffer(req.body.photo, 'base64'),
      {
        filename: filnamePath+filename
      },
      function(err:any){
        logger.taglog("warn","Erreur reception photo",err,['Creation Compte','Photo'])
        console.log("error "+err);
        res.status(200)
        res.send("OK")
      });
      // photo = filename+".jpg"
    }
  }
  
  //Créer un compte utilisateur
  creerCompteUser:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log("POST /users")

    let emailUser = req.body.email;
    let password = req.body.password

    logger.taglog("info","Demande Creation comptes",{email:req.body.email},['Creation Compte','Inscription'])
    //Vérifier si l'email existe
    Userdb.findOne({
      where: {
        email : emailUser,
      }
    }).then((element:any)=>{
      if(element) {
        console.log("User exists")
        logger.taglog('debug','Email existant',"L'adresse mail existe déja ",['Creation Compte',"Inscription"])
        res.status(400);
        res.send({
          error: "Requete invalide",
          code_err:'U01',
          msg_err:getMessageErreur('U01')
        })
      }else{
        //Le user n'existe pas, le créer
        console.log("User !exists")

        //Vérifier si la fonction existe
        Fonction.findAll({
          where:{id: req.body.fonction}
        }).then((result:any)=>{
          //Si la fonction envoyée ne fait pas partie des fonctions supportées
          if(!result){
            logger.taglog('error','Fonction inexistante','La fonction demandé nexiste pas ! ',['Creation Compte'])
            res.status(400);
            res.send({
              err:"Bad request",
              code_err:'U02',
              msg_err:getMessageErreur('U02')
            })
          }else{
            //Récupérer l'image et la sauvegarder
            //var filnamePath = "C:/Users/sol/Desktop/Projet/Backend/"
            var photo = null
            var filnamePath = "./"
            var filename = "assets/images/"+req.body.email
            //console.log(filename)
            if (req.body.photo != null) {
              base64.decode(new Buffer(req.body.photo, 'base64'),
              {
                filename: filnamePath+filename
              },
              function(err:any){
                logger.taglog("warn","Erreur reception photo",err,['Creation Compte','Photo'])

              });
              photo = filename+".jpg"
            }
            //Créer le user
            Userdb.create({
              email : emailUser,
              password: crypto.createHash('md5').update(req.body.password).digest('hex'),
    
              nom: req.body.nom,
              prenom: req.body.prenom,
              adresse: req.body.adresse,
              telephone: req.body.tel,
              photo: photo,
              fonctionId: req.body.fonction
            }).then( (created:any) =>{
              logger.taglog("info",'Creation Compte utilisateur',{id:created.id,fonction:created.fonction,email:created.email},['Creation Compte','Inscription Finie'])
            //Si le user est un client ou employeur on lui crée un compte bancaire courant
              if(created.fonctionId == "E" || created.fonctionId == "C"){
                CreationComptes.creerCompteCourant({
                  id:created.id
                },function(compte:any){
                  logger.taglog('info','Creation compte courant',{id:created.id, num_compte:compte.num_compte},['Creation Compte','Compte Courant'])
                  MailController
                  .sendMail(created.email,"Création compte utilisateur THARWA",
                  creationCompteUserClientMail(created.nom))
                  notifierBanquierNouveauCompteAValider()
                  
                  res.status(200);
                  res.send({
                    msg:"Le compte a été créé",
                    user : created.dataValues,
                    bank_compte: compte.dataValues
                  })
                }, (error:any)=>{
                  logger.taglog('error','Erreur creation Compte courant',error,['Creation Compte','Bug'])
                  res.status(500)
                  res.send({
                    err:"Erreur base de données",
                    code_err:error,
                    msg_err:getMessageErreur(error)
                  })
                })   
              }else{
                created.active = "TRUE"
                created.save()

                MailController
                .sendMail(created.email,"Création compte banquier THARWA",
                  creationCompteUserBanquierMail(created.nom,created.email,password))
                
                res.status(200);
                res.send({
                //  msg:"Le compte a été crée",
                  user : created.dataValues
                })
              }
            });
          }
        }) 
        // TODO: Vérfier avec un validateur les champs de la requetes
        
      }
    });
  }

  //Création du premier compte bancaire Courant
  public static creerCompteCourant=function(user:any,callback:Function, error:ErrorEventHandler){
    CreationComptes.genererNouveauNumeroCompte('DZD',function(numCompte:string){
      Compte.create({
        num_compte: numCompte,
        balance: 0.0,
        code_monnaie:"DZD",
        type_compte: COMPTE_COURANT,
        id_user:user.id
      }).then( (compte:any) =>{
        if(compte){
          console.log("Compte bancaire créé")
          //Ajouter le statut à l'historique
          AvoirStatut.create({
            num_compte: compte.num_compte,
            id_statut: 1,
          }).then( (result:any) => {
            callback(compte)
          });
        }else {
          error('D01')
        }  
      }).catch(Sequelize.ValidationError, function (err:any) {
        console.log(err.errors)
        error('D02')
      });
    },(err:any)=>{
      error(err)
    })
  } 

  //Créer un compte bancaire devise ou épargne
  creerCompteBancaire:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
        
      console.log("POST /comptes") 
      
      //TODO: récupérer user à partir des tokens
      let user = req.body.user;
      let typeCompte = req.body.type_compte;
      let monnaie = req.body.monnaie || "DZD" ;
      console.log(user,typeCompte,monnaie)

      let fonctionIds=['C','E']
      Userdb.findOne({
        where:{
          id:user,
          fonctionId:{
            $or:fonctionIds
          }
        }
      }).then((result:any)=>{
        if(!result){
          res.status(400);
          res.send({
            err:"Bad request",
            code_err:'U03',
            msg_err:getMessageErreur('U03')
          })
        }else{
          //vérifier code monnaie
          if(monnaies.indexOf(monnaie) == -1){
            res.status(400);
            res.send({
              err:"Bad request",
              code_err:'C02',
              msg_err:getMessageErreur('C02')
            })
          }
          //Vérifier typeCompte
          else if(typeComptes.indexOf(+typeCompte) == -1){
            //console.log(typeComptes.indexOf(+typeCompte)>-1,typeCompte)
            res.status(400);
            res.send({
              err:"Bad request",
              code_err:'C01',
              msg_err:getMessageErreur('C01')
            })
          }else if(typeCompte==COMPTE_COURANT){
            res.status(400);
            res.send({
              err:"Bad request",
              code_err:'C03',
              msg_err:getMessageErreur('C03') 
            })
          }else{
            Compte.findAll({
              where:{
                id_user: user,
                type_compte:typeCompte
              }
            }).then((results:any)=>{
              //
              let nbrResults = results.length
              //console.log(results.length)

              //Erreur si compte épargne à créer existe
              //2 comptes devise
              //compte devise à créer existe
              if((typeCompte==COMPTE_EPARGNE && nbrResults!=0) || 
              (typeCompte==COMPTE_DEVISE && nbrResults>1) ||
              (typeCompte==COMPTE_DEVISE && nbrResults==1 && results[0].code_monnaie==monnaie)){
                res.status(400);
                res.send({
                  err:"Bad request",
                  code_err:'C04',
                  msg_err:getMessageErreur('C04')
                })
              }else if((typeCompte==COMPTE_EPARGNE && monnaie!="DZD") ||
                (typeCompte==COMPTE_DEVISE && monnaie!="EUR" && monnaie!="USD") ){
                  res.status(400);
                  res.send({
                    err:"Bad request",
                    code_err:'C05',
                    msg_err:getMessageErreur('C05')
                  })
              }else{
                CreationComptes.genererNouveauNumeroCompte(monnaie,
                  function(numCompte:string){
                    Compte.create({
                      num_compte: numCompte,
                      balance: 0.0,
                      code_monnaie:monnaie,
                      type_compte: +typeCompte,
                      id_user: +user
                    }).then( (created2:any) =>{
                      console.log("Compte bancaire "+numCompte+" "+typeCompte+" crée")
                      //Ajouter le statut à l'historique
                      AvoirStatut.create({
                        num_compte: created2.num_compte,
                        id_statut: 1,
                      }).then( (result:any) => {
                        //console.log("Statut crée")

                        MailController
                        .sendMail(created2.email,"Création compte utilisateur THARWA",
                        creationCompteUserClientMail(created2.nom))
                        //TODO: send mail to banquier !!
                        notifierBanquierNouveauCompteAValider()

                        res.status(200);
                        res.send({
                          msg:"Le compte a été crée",
                          bank_compte: created2.dataValues,
                          statut: result.dataValues
                        })
                      });
                    }).catch(Sequelize.ValidationError, function (err:any) {
                      console.log(err.errors)
                      res.status(400);
                      res.send({
                        err:"Erreur DB",
                        code_err:'D02',
                        msg_err:getMessageErreur('D02')
                      });
                    });
                  }, (error:any)=>{
                    res.status(400);
                    res.send({
                      err:"Erreur DB",
                      code_err:error,
                      msg_err:getMessageErreur(error)
                    });
                })
              }
            }) 
          }
        }
      })
  }

  //Génération d'un nouveau numero de compte bancaire
  public static genererNouveauNumeroCompte(codeMonnaie:string, callback:Function,error:ErrorEventHandler){
    let numSeq;
    //Récupérer le numéro séquentiel
    Parametre.findOne({
      where:{
        id_param:NUM_SEQ_COMPTE
      }
    }).then( (result:any) =>{
      if(result){
        //Générer le numéro de comtpe
        var valeur : string = result.valeur
        numSeq = Number(valeur)+1
        numSeq = numSeq+""
        while (numSeq.length < 6) numSeq  = "0" + numSeq;
        
        result.valeur = numSeq
        result.save()
        //Le code du nouveau compte
        var numCompte = "THW"+numSeq+codeMonnaie
        //console.log("Num compte: "+numCompte)
        callback(numCompte)
      }else{
        error('D03')
      }
    })
  }

}

function notifierBanquierNouveauCompteAValider(){

  Userdb.findAll({
    where:{
      fonctionId:'B'
    }
  }).then((banquiers:any)=>{
    if(banquiers){
      banquiers.forEach((banquier:any) => {
        MailController
        .sendMail(banquier.email,"Nouvelle demande de création d'un compte Tharwa",
        nouvelleDemandeCreationCompteNotifBanquier())
      });
    }
  })
}