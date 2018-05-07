import * as Express from 'express'
import {Userdb} from '../../oauth2Server/models/User'
import {Fonction} from '../../oauth2Server/models/Fonction'
import {Compte} from '../../app/models/Compte'
import { AvoirStatut } from '../models/AvoirStatut';
import {Parametre} from '../models/Parametre'
import {Monnaie, monnaies} from '../models/Monnaie'
import {TypeCompte, typeComptes, COMPTE_COURANT, COMPTE_EPARGNE, COMPTE_DEVISE} from '../models/TypeCompte'

import {GestionComptes} from './GestionComptes'
import { type } from 'os';
import { MailController } from './mailController';
import { creationCompteUserBanquierMail, creationCompteUserClientMail, nouvelleDemandeCreationCompteNotifBanquier } from '../../config/messages';

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
    console.log(emailUser)
    
    //Vérifier si l'email existe
    Userdb.findOne({
      where: {
        email : emailUser,
      }
    }).then((element:any)=>{
      if(element) {
        console.log("User exists")
        res.status(401);
        res.send({
          error: "Requete invalide",
          msg_err:"L'utilisateur existe déjà"
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
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Le champ fonction est invalide" 
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
                console.log("error "+err);
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
              console.log("User created")
            //Si le user est un client ou employeur on lui crée un compte bancaire courant
              if(created.fonctionId == "E" || created.fonctionId == "C"){
                CreationComptes.creerCompteCourant({
                  id:created.id
                },function(compte:any){
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
                  res.status(500)
                  res.send({
                    err:"Erreur base de données",
                    msg_err:error 
                  })
                })
                /* let numSeq;
                Parametre.findOne({
                  where:{
                    id_param:2
                  }
                }).then( (result:any) =>{
                  if(result){
                    var valeur : string = result.valeur
                    numSeq = Number(valeur)+1
                    numSeq = numSeq+""
                    while (numSeq.length < 6) numSeq  = "0" + numSeq;
                    
                    result.valeur = numSeq
                    result.save()
                    //Le code du nouveau compte
                    var numCompte = "THW"+numSeq+"DZD"
                    console.log("Num compte: "+numCompte)

                    Compte.create({
                      num_compte: numCompte,
                      balance: 0.0,
                      code_monnaie:"DZD",
                      type_compte: 1,
                      id_user:created.id
                    }).then( (created2:any) =>{
                      console.log("Compte bancaire crée")
                      //Ajouter le statut à l'historique
                      AvoirStatut.create({
                        num_compte: created2.num_compte,
                        id_statut: 1,
                      }).then( (result:any) => {
                        console.log("Statut crée")
                        
                        MailController
                        .sendMail("no-reply@tharwa.dz",
                        created.email,"Création compte utilisateur THARWA",
                        creationCompteUserClientMail(created.nom))
                        notifierBanquierNouveauCompteAValider()
                        
                        res.status(200);
                        res.send({
                          msg:"Le compte a été crée",
                          user : created.dataValues,
                          bank_compte: created2.dataValues,
                          statut: result.dataValues
                        })
                      });
                    });
                  }
                });  */     
              }else{
                created.active = "TRUE"
                created.save()

                MailController
                .sendMail(created.email,"Création compte banquier THARWA",
                  creationCompteUserBanquierMail(created.nom,created.email,password))

                res.status(200);
                res.send({
                  msg:"Le compte a été crée",
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
          error('Erreur de création du compte courant')
        }  
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
            msg_err:"Le id user est erroné. Ou le user n'est pas un client" 
          })
        }else{
          //vérifier code monnaie
          if(monnaies.indexOf(monnaie) == -1){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Monnaie non supportée" 
            })
          }
          //Vérifier typeCompte
          else if(typeComptes.indexOf(+typeCompte) == -1){
            //console.log(typeComptes.indexOf(+typeCompte)>-1,typeCompte)
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Type compte erroné" 
            })
          }else if(!user || !typeCompte){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Champs user ou type compte manquants" 
            })
          }else if(typeCompte==COMPTE_COURANT){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Impossible de créer un compte courant " 
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
                  msg_err:"Vous ne pouvez pas créer un autre compte de ce type " 
                })
              }else if((typeCompte==COMPTE_EPARGNE && monnaie!="DZD") ||
                (typeCompte==COMPTE_DEVISE && monnaie!="EUR" && monnaie!="USD") ){
                  res.status(400);
                  res.send({
                    err:"Bad request",
                    msg_err:"La monnaie ne correspond pas au type du compte " 
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
                    });
                  }, (error:any)=>{
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
        id_param:2
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
        error('Erreur Base de données')
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
    banquiers.forEach((banquier:any) => {
      MailController
      .sendMail(banquier.email,"Nouvelle demande de création d'un compte Tharwa",
      nouvelleDemandeCreationCompteNotifBanquier())

    });
  })
}