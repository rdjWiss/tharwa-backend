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
import { Converssion, convertirMontant } from './Converssion';
import { start } from 'repl';

var base64 = require('node-base64-image')
let conversion = new Converssion()


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
    // console.log(justif)
    
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
            /* else if(comptes[0].id_user != comptes[1].id_user){
              res.status(400);
              res.send({
                err:"Bad request",
                msg_err:"Pas le même utilisateur" 
              })
            } */
            else{
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
                /* //Effectuer le virement: transaction
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
                  //Success */
                  //Générer le code de virement
                  var dateNow = new Date();
                  let code = genererCodeVir(dateNow,src,dest)
                  console.log("Code",code)

                  //Statut du virement
                  let statut = 2//valide par défaut
                  var filename = ""
                  var photo=null
                  if(+montant>=seuil) {
                    statut=1 //A valider
                    //Récupérer l'image du justificatif en base64
                    //var filnamePath = "C:/Users/sol/Desktop/Projet/Backend/"
                    var filnamePath = "./"
                    filename = "assets/justifs/"+code
                    console.log("File",filename);
                    // console.log(justif)
                    base64.decode(new Buffer(justif, 'base64'),
                      {filename: filnamePath+filename},
                      function(err:any){
                        console.log("Fichier")
                        console.log("err "+err);
                        /* res.status(400);
                          res.send({
                            err:"Error",
                            msg_err:err 
                          }) */
                          photo = filename+'.jpg'
                    });
                  }
                  console.log('photo',photo)

                  let vir = {
                    code:code,
                    montant:montant,
                    motif:motif,
                    dateNow:dateNow,
                    justif:photo,
                    src:src,
                    dest:dest,
                    statut:statut,
                    user: comptes[0].id_user,
                    type:1
                  }

                  if(comptes[0].type_compte == 3 || comptes[1].type_compte == 3){
                    // conversion.
                    convertirMontant(montant,
                      comptes[indiceSrc].code_monnaie,
                      comptes[1-indiceSrc].code_monnaie, 
                    (result:any)=>{
                      vir.montant = result.Result
                      console.log("Montant",vir.montant)
                      creerVirement(vir,
                        function(created:any){
                          console.log("Success")
                          res.status(200)
                          res.send(created)
                        },(error:any)=>{
                          console.log("err",error)
                          res.status(400);
                          res.send({
                            err:"Error",
                            msg_err:error 
                          })
                        })
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
                /* }).catch(function (err:any) {
                  //TRANSACT Failed
                  res.status(400);
                  res.send({
                    err:"Error",
                    msg_err:"Impossible d'effectuer la transaction"
                  })
                }); */
              }
            }
          }
        })
      }
    }
  }

  //Virement dont la source est THW (destination: THW ou autre)
  public virementSrcTHW:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log("POST /virements/2")

    let user = req.body.user
    let src = req.body.src
    let dest = req.body.dest
    let montant = req.body.montant
    let motif = req.body.motif
    let justif = req.body.justif  
    console.log(src,"to",dest)
    
    //true si dest thw sinon vers externe
    let virTHW = (dest.substr(0,3)=="THW")
    //console.log(dest.substr(0,3))

    if(src == dest){
      res.status(400);
      res.send({
        err:"Bad request",
        msg_err:"La source et dest doivent etre diff" 
      })
    }else if(+montant>=seuil && !justif){
      res.status(400);
      res.send({
        err:"Bad request",
        msg_err:"Veuillez fournir un justificatif. Le montant dépasse le seuil de non validation" 
      })
    }else{
      if(virTHW){
      //Vérifier les virements possible; 
      let numComptes = [src,dest]
      Compte.findAll({
        where:{
          num_compte:{
            $or: numComptes
          },
        }
      }).then((comptes:any)=>{   
        //On a récupéré moins de deux comptes 
        if(comptes.length<2){
          res.status(400);
          res.send({
            err:"Bad request",
            msg_err:"Le numéro de compte est erroné" 
          })
        }else {
          let indiceSrc=0;
          if(comptes[1].num_compte == src) indiceSrc=1

          if(comptes[indiceSrc].id_user != user){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Le compte src n'appartient pas au user" 
            })
          } 
          //Si un des comptes n'est pas actif
          else if((comptes[0].statut_actuel!=2) || comptes[1].statut_actuel!=2){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"L'un des comptes est bloqué" 
            })
          }
          //Vir Possible: seulement courant <-> courant
          else if((comptes[0].type_compte!=1 || comptes[1].type_compte!=1 )){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Impossible d'effectuer un virement entre des comptes no courant" 
            })
          }//Vérifier propriétaires diff
          else if(comptes[0].id_user == comptes[1].id_user){
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Meme utilisateur" 
            })
          }else{
            //Vérification de la balance du compte
            if(comptes[indiceSrc].balance < montant){
              res.status(400);
              res.send({
                err:"Bad request",
                msg_err:"Vous n'avez pas assez d'argent pour effectuer ce virement" 
              })
            }else{
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
              }).then(function (result:any) {//Transact Success
                //Générer le code de virement
                var dateNow = new Date();
                let code = genererCodeVir(dateNow,src,dest)
                //console.log("Code",code)

                //Statut du virement
                let statut = 2//valide par défaut
                let filename = ""
                if(+montant>=seuil) {
                  statut=1
                  var filnamePath = "./"
                    filename = "assets/justifs/"+code
                    console.log("File",filename);
                   // console.log(justif)
                    base64.decode(new Buffer(justif, 'base64'),
                      {filename: filnamePath+filename},
                      function(err:any){
                        console.log("Fichier")
                        console.log("err "+err);
                        /* res.status(400);
                          res.send({
                            err:"Error",
                            msg_err:err 
                          }) */
                    });
                }

                //Créer le virement
                Virement.create({
                    code_virement:code,
                    montant:montant,
                    motif:motif,
                    date_virement:dateNow,
                    justif:justif+".jpg",
                    emmetteur:src,
                    recepteur:dest,
                    statut_virement:statut
                }).then((created:any)=>{
                  console.log(created.dataValues)
                  //Rechercher l'email du user
                  let user = comptes[0].id_user
                  Userdb.findOne({
                    where:{
                      id:user
                    },
                    attribures:['nom','email','telephone']
                  }).then((found:any)=>{
                    let mailSrc=""
                    let mailDest = ""
                    //Envoi mail de notifs
                    MailController
                    .sendMail("no-reply@tharwa.dz",
                      found.email,
                      "Virement émis",
                      virSortantMail(found.nom,dest,montant))
                    /* .then(()=>{
                      console.log("Mail Sent")
                      res.status(200)
                      res.send(created)
                    }).catch((error:any)=>{
                        res.status(500)
                        res.send("Impossible d'envoyer le mail. ")
                    }) */
                    //Envoi SMS
                  })
                })   
              }).catch(function (err:any) {
                //TRANSACT Failed
                res.status(400);
                res.send({
                  err:"Error",
                  msg_err:err 
                })
              });
            }
          
          }
          }     
      })
    }else{
      res.status(400);
      res.send({
        err:"Bad request",
        msg_err:"Pas encore traité." 
      })
    }
    }
  }

    //Récupérer les virement à valider
    public getVirementAValider:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
   
      let statut = req.param('statut')
      console.log("GET /virements?statut="+statut)
      
      //Vérifier que le statut est 
      StatutVirement.findOne({ 
        where:{
          id_statut:statut
        }
      }).then((result:any)=>{
        if(!result){
          res.status(400);
          res.send({
            err:"Bad request",
            msg_err:"Statut invalid" 
          })
        }else{
          Virement.findAll({
            where:{
              statut_virement:1
            }
          }).then((results:any)=>{
            res.status(200)
            res.send(results) 
          })
  
        }
      })
  
    }

     //Valider un virement
  public validateVir:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    let statut = req.body.statut
    let motif = req.body.motif
    console.log(motif)

    let codeVir = req.params.codeVir
    console.log("PUT virements/"+codeVir)

    //TODO: les différentes possiblité passage statut

    StatutVirement.findOne({ 
      where:{
        id_statut:statut
      }
    }).then((result:any)=>{
      if(!result){
        res.status(400)
        res.send({
          err:"Bad request",
          msg_err: "Statut erroné"
        })
      }else{
        Virement.findOne({
          where:{
            code_virement:codeVir,
          }
        }).then((virement:any)=>{
          //console.log(virement.dataValues)
          if(!virement){
            res.status(400)
            res.send({
              err:"Bad request",
              msg_err: "Code virement erroné"
            })
          }else{
            //Valider
            virement.statut_virement = statut;
            virement.save()

            //Envoyer mail aux src et dest
            let numComptes = [virement.emmetteur, virement.recepteur]
            Compte.findAll({
              where:{
                num_compte:{
                  $or: numComptes
                }
              }
            }).then((comptes:any) =>{
                let indiceSrc=0
                if(comptes[1].num_compte == virement.emmetteur) indiceSrc=1

                let objetMail = ""
                let msg = ""

                Userdb.findOne({
                  where:{
                    id:comptes[indiceSrc].id_user
                  }
                }).then((user:any) =>{
                  if(statut==2){
                    objetMail = "Validation virement"
                    if(comptes[0].id_user == comptes[1].id_user ){
                      msg = validationVirEntreComptesMail(user.nom,virement.emmeteur, 
                        virement.recepteur,virement.montant)
                    }else{
                      msg= validationVirSortantMail(user.nom,comptes[1-indiceSrc].num_compte,
                        virement.montant) 
                    }
                  }else if(statut == 3){
                    objetMail = "Rejet virement"
                    if(comptes[0].id_user == comptes[1].id_user ){
                      msg = validationVirSortantMail(user.nom,virement.emmeteur, 
                        virement.montant)
                    }else{
                      msg = rejetVirSortantMail(user.nom,virement.emmeteur, 
                        motif)
                    }
                  }

                  MailController
                      .sendMail("no-reply@tharwa.dz",
                        user.email,
                        objetMail,msg
                       )
                      /* .then(()=>{
                        console.log("Mail Sent")
                        res.status(200)
                        res.send("ok")
                      }).catch((error:any)=>{
                          res.status(500)
                          res.send("Impossible d'envoyer le mail. ")
                      }) */
                })
            })

          }
        })
      }
    })
    }
  }

  export function creerVirement(vir:any, callback:Function,error:ErrorEventHandler){
    // console.log("justif",vir.justif)
    Virement.create({
      code_virement:vir.code,
      montant:vir.montant,
      motif:vir.motif,
      date_virement:vir.dateNow,
      justificatif:vir.justif,
      emmetteur:vir.src,
      recepteur:vir.dest,
      statut_virement:vir.statut
    }).then((created:any)=>{
    //Rechercher l'email du user
    Userdb.findOne({
      where:{
        id:vir.user
      },
      attribures:['nom','email','telephone']
    }).then((found:any)=>{
      if(found){
        //TODO: indiquer les noms (types) de compte au lieu de numéro
      //Envoi mail de notifs
      MailController
      .sendMail("no-reply@tharwa.dz",
        found.email,
        "Virement entre vos comptes",
        virEntreComptesMail(found.nom,vir.src,
          vir.dest,vir.montant))
      /* .then(()=>{
        console.log("Mail Sent")
        callback(created)
      }).catch((err:any)=>{
        console.log("kjflsq")
        error("Impossible d'anvoyer un mail")
      }) */
      callback(created)
      }else{
        error("Impossible de trouver le user")
      }
      
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
    let MM=(date.getMonth()+1).toString()
    let DD=(date.getDate()).toString()
    let HH=(date.getHours()).toString()
    let UU=(date.getMinutes()).toString()
    let SS=(date.getSeconds()).toString()
    
    if(MM.length<2) MM = '0'+MM
    if(DD.length<2) DD = '0'+DD
    if(HH.length<2) HH = '0'+HH
    if(UU.length<2) UU = '0'+UU
    if(SS.length<2) SS = '0'+SS

    return src+dest+YYYY+MM+DD+HH+UU+SS
  }

