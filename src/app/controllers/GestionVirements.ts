import * as Express from 'express'
import { sequelize } from '../../config/db';
import {Parametre, seuil} from '../models/Parametre'
import {Compte} from '../models/Compte'
import {Virement} from '../models/Virement'
import {Userdb} from '../../oauth2Server/models/User'
import {StatutVirement} from '../models/StatutVirement'

import { MailController } from './mailController';
import {virEntreComptesMail, 
        virSortantMail,
        validationVirEntreComptesMail,rejetVirEntreComptesMail,
        validationVirSortantMail,rejetVirSortantMail } from '../../config/messages';
import { modeleMail } from '../../config/modelMail';
import { Converssion } from './Converssion';
import { start } from 'repl';

var base64 = require('node-base64-image')
let conversion = new Converssion()

/* res.status(400);
      res.send({
        err:"Bad request",
        msg_err:"La source et dest doivent etre diff" 
      }) */

export class GestionVirements{

  //Virement entre comptes du meme user
  virementEntreComptes:Express.RequestHandler
      =function (req:Express.Request,res:Express.Response,next:any){
        
    console.log("POST /virement/1")
    
    //TODO: utiliser taux de change pour transformer devise dinar

    let user = req.body.user
    let src = req.body.src
    let dest = req.body.dest
    let montant = req.body.montant
    let motif = req.body.motif
    let justif = req.body.justif  
    
    console.log(src,"to", dest)    

    if(src == dest){
      res.status(400);
      res.send({
        err:"Bad request",
        msg_err:"La source et dest doivent etre diff" 
      })
    }else{
      if(+montant>=seuil && !justif){
        res.status(400);
        res.send({
          err:"Bad request",
          msg_err:"Veuillez fournir un justificatif. Le montant dépasse le seuil de non validation" 
        })
      }else{
        //Vérifier les virements possible
        let numComptes = [src,dest]
        Compte.findAll({
          where:{
            num_compte:{
              $or: numComptes
            },
            id_user: user
          }
        }).then((comptes:any)=>{
          //console.log(comptes.length)
          if(comptes.length<2){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:`L'un des numéros de comptes est erroné. 
              Ou l'un de ces comptes ne vous appartient pas
              `
            })
          }else{
            //Si un des comptes n'est pas actif
            //TODO: plus d'infos de quels compte n'est pas actif
            if((comptes[0].statut_actuel!=2) || comptes[1].statut_actuel!=2){
              res.status(400);
              res.send({
                err:"Bad request",
                msg_err:"L'un des comptes n'est pas actif" 
              })
            }
            //Possible: 1->2/3, 2->1, 3->1
            //Interdit: 2<->3
            else if((comptes[0].type_compte==2 && comptes[1].type_compte==3 ) || 
            (comptes[0].type_compte==3 && comptes[1].type_compte==2 )){
              res.status(400);
              res.send({
                err:"Bad request",
                msg_err:"Impossible d'effectuer un virement entre epargne et devise" 
              })
            }//Vérifier meme propriétaire
            else if(comptes[0].id_user != comptes[1].id_user){
              res.status(400);
              res.send({
                err:"Bad request",
                msg_err:"Pas le même utilisateur" 
              })
            }else{
              let indiceSrc=0;
              if(comptes[1].num_compte == src) indiceSrc=1

              if(comptes[indiceSrc].balance < montant){
                res.status(400);
                res.send({
                  err:"Bad request",
                  msg_err:"Vous n'avez pas assez d'argent pour effectuer ce virement" 
                })
              }
              else{
                //Effectuer le virement: transaction
                sequelize.transaction(function (t:any) {
                  //Mettre à jours les balances des comptes
                  return Compte.update({
                    balance: comptes[indiceSrc].balance - +montant
                  }, {
                    where:{
                      num_compte:comptes[indiceSrc].num_compte
                    }
                  }, {transaction: t}).then(function () {
                    return Compte.update({
                      balance: comptes[1-indiceSrc].balance + +montant
                    },{
                      where:{
                        num_compte:comptes[1-indiceSrc].num_compte
                      }
                    }, {transaction: t});
                  });
                }).then(function (result:any) {
                  //Success
                  //Générer le code de virement
                  var dateNow = new Date();
                  let code = genererCodeVir(dateNow,src,dest)
                  //console.log("Code",code)

                  //Statut du virement
                  let statut = 2//valide par défaut
                  var filename = ""
                  if(+montant>=seuil) {
                    statut=1 //A valider
                    //TODO: Récupérer l'image du justificatif en base64
                    var filnamePath = "C:/Users/sol/Desktop/Projet/Backend/"
                    filename = "assets/justifs/"+code
                    console.log(filename);
                    //console.log(req.body.photo)
                    base64.decode(new Buffer(justif, 'base64'),
                      {filename: filnamePath+filename},
                      function(err:any){
                        console.log("Fichier")
                        console.log("err "+err);
                    });
                  }

                  let vir = {
                    code:code,
                    montant:montant,
                    motif:motif,
                    dateNow:dateNow,
                    justif:filename,
                    src:src,
                    dest:dest,
                    statut:statut,
                    user: comptes[0].id_user
                  }

                  if(comptes[0].type_compte == 3 || comptes[1].type_compte == 3){
                    conversion.convertirMontant(montant,
                      comptes[indiceSrc].code_monnaie,
                      comptes[1-indiceSrc].code_monnaie, 
                    (res:any)=>{
                      vir.montant = res.Result
                      console.log("Montant",vir.montant)
                      creerVirement(vir,
                        function(created:any){
                          console.log("Success")
                          res.status(200)
                          res.send(created)
                        },
                      /* (error:any)=>{
                        console.log("err",error)
                        res.status(400);
                        res.send({
                          err:"Error",
                          msg_err:"Impossible d'anvoyer un mail" 
                        })
                      }) */
                      /* creerVirement(vir,(created:any)=>{
                        console.log("Mail Sent")
                        res.status(200)
                        res.send(created)
                      },(error:any)=>{
                        res.status(400);
                        res.send({
                          err:"Error",
                          msg_err:"Impossible d'anvoyer un mail" 
                        })
                      }) */
                    }, (error:any)=>{
                      res.status(400);
                      res.send({
                        err:"Error",
                        msg_err:"Impossible de contacter l'API de taux de change" 
                      })
                    })
                  }
                  else {
                    console.log(vir)
                    creerVirement(vir,(created:any)=>{
                      console.log("Mail Sent")
                      res.status(200)
                      res.send(created)
                    },(error:any)=>{
                      res.status(400);
                      res.send({
                        err:"Error",
                        msg_err:"Impossible d'anvoyer un mail" 
                      })
                    })
                  }  
                }).catch(function (err:any) {
                  //TRANSACT Failed
                  res.status(400);
                  res.send({
                    err:"Error",
                    msg_err:"Impossible d'effectuer la transaction"
                  })
                });
              }
            }
          }
        })
      }
    }
  }

  
}
  function creerVirement(vir:any, callback:Function,error:ErrorEventHandler){
    Virement.create({
      code_virement:vir.code,
      montant:vir.montant,
      motif:vir.motif,
      date_virement:vir.dateNow,
      justif:vir.justif,
      emmetteur:vir.src,
      recepteur:vir.dest,
      statut_virement:vir.statut
    }).then((created:any)=>{
    //console.log(created.dataValues)
    //Rechercher l'email du user
    Userdb.findOne({
      where:{
        id:vir.user
      },
      attribures:['nom','email','telephone']
    }).then((found:any)=>{
      //TODO: indiquer les noms (types) de compte au lieu de numéro
      //Envoi mail de notifs
        MailController
        .sendMail("no-reply@tharwa.dz",
          found.email,
          "Virement entre vos comptes",
          virEntreComptesMail(found.nom,vir.src,
            vir.dest,vir.montant))
        .then(()=>{
          console.log("Mail Sent fdsfs")
          callback(created)
        })
       /*  .catch((err:any)=>{
          console.log("kjflsq")
          return;
          //error("Impossible d'anvoyer un mail")
         
        }) */
      //Envoi SMS
      })
    })
  }


  export function genererCodeVir(date: Date, src:string, dest:string): string{
    //var dateNow = new Date();
    let YYYY=date.getFullYear()
    let MM=date.getMonth()+1
    let DD=date.getDate()
    let HH=date.getHours()
    let UU=date.getMinutes()
    let SS=date.getSeconds()
    
    return src+dest+YYYY+MM+DD+HH+UU+SS
  }

