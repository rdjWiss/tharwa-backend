import * as Express from 'express'
import {Userdb} from '../../oauth2Server/models/User'
import {Fonction} from '../../oauth2Server/models/Fonction'
import {Compte} from '../../app/models/Compte'
import { AvoirStatut } from '../models/AvoirStatut';
import {Parametre} from '../models/Parametre'
import {Monnaie, monnaies} from '../models/Monnaie'
import {TypeCompte, typeComptes} from '../models/TypeCompte'

import {GestionComptes} from './GestionComptes'
import { type } from 'os';

var crypto = require('crypto')
var base64 = require('node-base64-image')

const gestionComptes = new GestionComptes();

export class CreationComptes{
  
  //Créer un compte utilisateur
  creerCompteUser:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log("POST /users")

    let emailUser = req.body.email;
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
            var filnamePath = "C:/Users/sol/Desktop/Projet/Backend/"
            var filename = "assets/images/"+req.body.email
            //console.log(filename);
            //console.log(req.body.photo)
            base64.decode(new Buffer(req.body.photo, 'base64'),{filename: filnamePath+filename},
              function(err:any){
                console.log("err "+err);
            });
            //Créer le user
            Userdb.create({
            email : emailUser,
            password: crypto.createHash('md5').update(req.body.password).digest('hex'),
  
            nom: req.body.nom,
            prenom: req.body.prenom,
            adresse: req.body.adresse,
            telephone: req.body.tel,
            photo: filename+".jpg",
            fonctionId: req.body.fonction
    
            }).then( (created:any) =>{
              console.log("User created")
            //Si le user est un client ou employeur on lui crée un compte bancaire courant
              if(created.fonctionId == "E" || created.fonctionId == "C"){
                //On récupère le numéro séquentiel
                let numSeq;
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
                });      
              }else{
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

  //Créer un compte bancaire devise ou épargne
  creerCompteBancaire:Express.RequestHandler
      =function (req:Express.Request,res:Express.Response,next:any){
        
      console.log("POST /comptes") 
      
      //TODO: récupérer user à partir des tokens
      let user = req.body.user;
      let typeCompte = req.body.type_compte;
      let monnaie = req.body.monnaie || "DZD" ;
      //console.log(monnaie)
      //console.log(user+" "+typeCompte)

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
      }else if(typeCompte=="1"){
        res.status(400);
        res.send({
          err:"Bad request",
          msg_err:"Pas possible de créer un compte courant " 
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

          //Erreur si
          //compte épargne à créer existe
          //2 comptes devise
          //compte devise à créer existe
          if((typeCompte=="2" && nbrResults!=0) || (typeCompte=="3" && nbrResults>1) ||
          (typeCompte=="3" && nbrResults==1 && results[0].code_monnaie==monnaie)){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Vous ne pouvez pas créer un autre compte de ce type " 
            })
          }else if((typeCompte=="2" && monnaie!="DZD") ||
            (typeCompte=="3" && monnaie!="EUR" && monnaie!="USD") ){
              res.status(400);
              res.send({
                err:"Bad request",
                msg_err:"La monnaie ne correspond pas au type du compte " 
              })
          }else{
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
                var numCompte = "THW"+numSeq+monnaie
                //console.log("Num compte: "+numCompte)

                //console.log(typeCompte)
                //console.log(numCompte,monnaie,typeCompte,user)

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

                    //TODO: send mail to banquier !!

                    res.status(200);
                    res.send({
                      msg:"Le compte a été crée",
                      bank_compte: created2.dataValues,
                      statut: result.dataValues
                    })
                  });
                });
              }
            });   
          }
          
        })
          
      }
  }

}