import * as Express from 'express'
import {Userdb} from '../../oauth2Server/models/User'
import {Compte} from '../../app/models/Compte'
import { AvoirStatut } from '../models/AvoirStatut';
import {statutComptes} from '../models/StatutCompte'
import { sequelize } from '../../config/db';
import { stat } from 'fs';
import { MailController } from './mailController';
import { verificationMail, validationCompteUserMail, rejetCompteUserMail,
  validationCompteBankMail,rejetCompteBankMail } from '../../config/messages';
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

  public getComptes:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
   
    let statut = req.param('statut')
    console.log("GET /comptes?statut="+statut)
    
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
          if(element.type_compte == 1) element.type_compte = "Courant"
          else if (element.type_compte == 2) element.type_compte = "Epargne"
          else if (element.type_compte == 3) element.type_compte = "Devise"

          Userdb.findOne({
            where:{
              id:element.id_user
            },
            attributes: ['id', 'nom', 'prenom', 'photo','email','fonctionId','adresse','telephone']
          }).then((user:any)=>{
            element.user = user

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

  //Modifier le statut d'un compte bancaire
  public modifCompte:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    
    let statut = req.body.statut
    let motif = req.body.motif

    let numCompte = req.params.numCompte
    console.log("PUT comptes/"+numCompte)
    
    //TODO: Vérifier que seule les banquiers peuvent executer cette fonction
    //TODO: Vérifier si de bloqué vers actif ou vs motif obligatoire
    //TODO: Vérifier les passage possible entre statuts

    //Vérifier que le statut n'est pas null
    //Vérifier que le statut fait partie des statuts considérés
    if(statut == null || statutComptes.indexOf(+statut) == -1 ){
      res.status(400)
      res.send({
        err:"Bad request",
        msg_err: "Statut erroné"
      })
    }
    else{
    //Rechercher le dernier statut du compte
      AvoirStatut.findOne({
        where:{
          num_compte: numCompte,
        },
        order:[['date_statut','DESC']],
        limit: 1
      }).then((result:any)=>{
        if(result){
        //Si le l'ancien statut == nouveau statut => rejet
          if(result.id_statut == statut){
            res.status(401)
            res.send({
              err:"Erreur",
              msg_err:"Not modified"
            })
          }else{//Sinon
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
                    if(ancienStat == "1"){
                      //Si validation du compte
                      if(statut == "2"){
                        if(compte.type_compte == 1){
                          //Si c'est le premier compte (courant) du user, activer son compte
                          console.log('Compte Courant')
                          user.active = "TRUE"
                          user.save()
                          console.log(user.email)
                          message = validationCompteUserMail(user.nom)
                          objetMail = "Validation compte THARWA"
                        }else{
                          //TODO: validation d'un autre compte bancaire, le msg est diff
                          if(compte.type_compte==2){
                            console.log('Compte epargne')
                            message = validationCompteBankMail(user.nom,"épargne")
                          }else if(compte.type_compte==3){
                            console.log('Compte devise')
                            message = validationCompteBankMail(user.nom,"devise")
                          }
                          objetMail = "Validation compte bancaire THARWA"
                        }
                      }else if (statut==4){
                        if(compte.type_compte == 1){
                          message = rejetCompteUserMail(user.nom)
                          objetMail = "Rejet compte THARWA"
                        }else{
                          //TODO: validation d'un autre compte bancaire, le msg est diff
                          if(compte.type_compte==2){
                            message = rejetCompteBankMail(user.nom,"épargne")
                          }else if(compte.type_compte==3){
                            message = rejetCompteBankMail(user.nom,"devise")
                          }
                          objetMail = "Rejet création compte bancaire THARWA"
                        }
                      }

                      MailController
                      .sendMail("no-reply@tharwa.dz",
                        user.email,objetMail,
                        message)
                      .then(()=>{
                        console.log("Mail Sent")
                        res.status(200)
                        res.send(result)
                      }).catch((error:any)=>{
                        console.log("Impossible d'envoyer le code.")
                          res.status(500)
                          res.send("Impossible d'envoyer le code. ")
                      })
                    }else {
                    //TODO: traiter les autres cas
                    //Actif -> Bloqué
                    //Bloqué -> Actif
                    res.status(200)
                    res.send("OK ")
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
}

  