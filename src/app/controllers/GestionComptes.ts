import * as Express from 'express'
import {Userdb} from '../../oauth2Server/models/User'
import {Compte} from '../../app/models/Compte'
import { AvoirStatut } from '../models/AvoirStatut';
import {statutComptes, STATUT_COMPTE_REJETE, STATUT_COMPTE_BLOQUE, STATUT_COMPTE_AVALIDER, STATUT_COMPTE_ACTIF} from '../models/StatutCompte'
import { sequelize } from '../../config/db';
import { stat } from 'fs';
import { MailController } from './mailController';
import { verificationMail, validationCompteUserMail, rejetCompteUserMail,
  validationCompteBankMail,rejetCompteBankMail } from '../../config/messages';
import { COMPTE_EPARGNE, COMPTE_DEVISE, COMPTE_COURANT } from '../models/TypeCompte';
const Sequelize = require('cu8-sequelize-oracle');

export class GestionComptes{

  public userExist:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log('GET users/'+req.params.userEmail)
    
    //Rechercher le user en bdd
    Userdb.findOne({
      where: {
        email : req.params.userEmail
      }
    }).then((element:any) => {
      //Si trouvé
      if(element){
        console.log("email exist")
        res.status(200);
        res.send({
          exist: "true"
        })
      }else{//Sinon
        console.log("email !exist")
        res.status(200);
        res.send({
          exist: "false"
        })
      } 
    })
  }

  //Récupérer la liste des comptes d'un user donné
  public getComptesClient:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any) {
    let id_user = parseInt(req.params.idUser)
    console.log("GET /users/"+id_user+"/comptes")

    Userdb.findOne({
      where:{
        id:id_user
      }
    }).then((user:any)=>{
      if(!user){
        res.status(400);
        res.send({
          err:"Bad request",
          msg_err:"Id user erroné" 
        })
      }else{
        Compte.findAll({
          where:{
            id_user:id_user
          }
        }).then((comptes:any)=>{
          res.status(200)
          res.send(comptes)
        })
      }
    })
  }

  //Récupérer les comptes d'un statut donné
  public getComptes:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    let statut = parseInt(req.query.statut)
    console.log("GET /comptes?statut="+statut)
    
    if(statutComptes.indexOf(statut) == -1){
      res.status(400);
      res.send({
        err:"Bad request",
        msg_err:"Statut erroné" 
      })
    }else{
      //Rechercher les comptes dont le statut actuel = statut voulu
      Compte.findAll({
        where:{
          statut_actuel: statut
        },attributes:['num_compte', 'type_compte', 'code_monnaie', 'id_user','statut_actuel']
      }).then((results:any) =>{
        if(results){
          var users:any = []
          //Récupérer les id des users des comptes concernés
          results.forEach((element:any) => {

            //TODO: A changer par un acces à la bdd
            if(element.type_compte == COMPTE_COURANT) 
              element.type_compte = "Courant"
            else if (element.type_compte == COMPTE_EPARGNE) 
              element.type_compte = "Epargne"
            else if (element.type_compte == COMPTE_DEVISE) 
              element.type_compte = "Devise"

            Userdb.findOne({
              where:{
                id:element.id_user
              },
              attributes: ['id', 'nom', 'prenom', 'photo','email','fonctionId','adresse','telephone']
            }).then((user:any)=>{
              
              element.user = user
              if(!user) console.log("user",user,element.id_user)
              users.push({
                compte:element.dataValues,
                user:user.dataValues
              })
            });
          });
          setTimeout(function() {
            res.status(200)
            res.send(users) 
          }, 100) 
        }else{
          res.status(404);
          res.send({
            error: "Not found",
            error_msg:""
          })
        }
      });
    }
    
  
  }

  //Modifier le statut d'un compte bancaire
  public modifCompte:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    
    let statut = req.body.statut
    let motif = req.body.motif

    let numCompte = req.params.numCompte
    console.log("PUT comptes/"+numCompte)
    
    //TODO: Vérifier que seule les banquiers peuvent executer cette fonction 

    //Vérifier que le statut fait partie des statuts considérés et non null
    if(statut == null || statutComptes.indexOf(+statut) == -1 ){
      res.status(400)
      res.send({
        err:"Bad request",
        msg_err: "Statut erroné"
      })
    }
    else{
      Compte.findOne({
        where:{
          num_compte:numCompte
        }
      }).then((result:any)=>{
        if(result){
          if(!GestionComptes.isValidChangementStatut(result.statut_actuel,statut)){
            res.status(400)
            res.send({
              err:"Erreur",
              msg_err:"Modification statut non permise"
            })
          }  
          else{
            //Les modifications nécessitant un motif
            if(GestionComptes.isChangementStatutNecessitantMotif(result.statut_actuel,statut) 
                && motif==null){
              res.status(400)
              res.send({
                err:"Erreur",
                msg_err:"Motif obligatoire"
              })
            }else {
              //Créer un nouveau statut du compte dans la table AvoirsStatut
              AvoirStatut.create({
                num_compte : numCompte,
                id_statut: statut,
                motif: motif
              }).then((result:any) =>{
                //Actualiser le statut actuel du compte
                Compte.findOne({
                  where:{
                    num_compte: numCompte
                  },
                  attributes:['statut_actuel','id_user','num_compte','type_compte']
                }).then((compte:any)=>{
                  var ancienStat = compte.statut_actuel
                  compte.statut_actuel = statut
                  compte.save() //l'enregistrer
                  console.log("statut actuel "+compte.statut_actuel)

                  //Rechercher le user et lui envoyé un mail
                  //Le user reçoit un mail pour tout changement d'état de ses comptes
                  Userdb.findOne({
                    where:{id: compte.id_user},
                    attributes:['active','id','nom','email']
                  }).then((user:any)=>{
                    if(user){
                      let objetMail: string = ""
                      let message: string = ""

                      //Si le compte été non valide 
                      if(ancienStat == STATUT_COMPTE_AVALIDER){
                        //Si validation du compte
                        if(statut == STATUT_COMPTE_ACTIF){
                          if(compte.type_compte == COMPTE_COURANT){
                            //Si c'est le premier compte (courant) du user, activer son compte
                            console.log('Compte Courant')
                            user.active = "TRUE"
                            user.save()
                            console.log(user.email)
                            message = validationCompteUserMail(user.nom)
                            objetMail = "Validation compte THARWA"
                          }else{
                            // validation d'un autre compte bancaire, le msg est diff
                            if(compte.type_compte==COMPTE_EPARGNE){
                              console.log('Compte epargne')
                              message = validationCompteBankMail(user.nom,"épargne")
                            }else if(compte.type_compte == COMPTE_DEVISE){
                              console.log('Compte devise')
                              message = validationCompteBankMail(user.nom,"devise")
                            }
                            objetMail = "Validation compte bancaire THARWA"
                          }
                        }else if (statut==STATUT_COMPTE_REJETE){
                          if(compte.type_compte == COMPTE_COURANT){
                            message = rejetCompteUserMail(user.nom,motif)
                            objetMail = "Rejet compte THARWA"
                          }else{
                            //TODO: validation d'un autre compte bancaire, le msg est diff
                            if(compte.type_compte==COMPTE_EPARGNE){
                              message = rejetCompteBankMail(user.nom,"épargne",motif)
                            }else if(compte.type_compte==COMPTE_DEVISE){
                              message = rejetCompteBankMail(user.nom,"devise",motif)
                            }
                            objetMail = "Rejet création compte bancaire THARWA"
                          }
                        }

                        MailController
                        .sendMail("no-reply@tharwa.dz",
                          user.email,objetMail,
                          message)

                          res.status(200)
                          res.send(result)
                      }else {
                      //TODO: traiter les autres cas
                      //Actif -> Bloqué
                      //Bloqué -> Actif
                      res.status(200)
                      res.send("OK")
                      }
                      
                    }else{
                      res.status(401)
                      res.send({
                        err:"Not Found",
                        msg_err:"User not found"
                      })
                    }
                  })
                })
              });
            }
            
          }
        }else { 
          res.status(404)
          res.send({
            err:"Not Found",
            msg_err:"Compte not found"
          })
        }
      })
    }

  }

  public static isValidChangementStatut = function(ancienStatut:any, nouveauStatut:any):boolean{
    return (ancienStatut==STATUT_COMPTE_AVALIDER && 
                    (nouveauStatut==STATUT_COMPTE_ACTIF || nouveauStatut==STATUT_COMPTE_REJETE ))
            || (ancienStatut==STATUT_COMPTE_ACTIF && nouveauStatut==STATUT_COMPTE_BLOQUE)
            || (ancienStatut == STATUT_COMPTE_BLOQUE && nouveauStatut == STATUT_COMPTE_ACTIF)        
    /*
      POSSIBLE: AVALIDER -> ACTIF / AVALIDER -> REJETE 
                ACTIF -> BLOQUE / BLOQUE -> ACTIF
      X AVALIDER -> BLOQUE / ACTIF -> REJETE / * -> AVALIDER
      X BLOQUE -> REJETE
      */
  }

  public static isChangementStatutNecessitantMotif = function(ancienStatut:any, nouveauStatut:any):boolean{
    return  (nouveauStatut == STATUT_COMPTE_REJETE 
          || nouveauStatut == STATUT_COMPTE_BLOQUE 
          || (ancienStatut == STATUT_COMPTE_BLOQUE && nouveauStatut == STATUT_COMPTE_ACTIF)) 
  }


}

  