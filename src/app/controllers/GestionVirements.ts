import * as Express from 'express'
import { sequelize } from '../../config/db';
import {Parametre, seuil} from '../models/Parametre'
import {Compte} from '../models/Compte'
import {Virement} from '../models/Virement'
import {Userdb, getUserContact} from '../../oauth2Server/models/User'
import {StatutVirement, STATUT_VIR_VALIDE, STATUT_VIR_AVALIDER} from '../models/StatutVirement'

import { MailController } from './mailController';
import {virEntreComptesMail, 
        virSortantMail,
        validationVirEntreComptesMail,rejetVirEntreComptesMail,
        validationVirSortantMail,rejetVirSortantMail } from '../../config/messages';
import { modeleMail } from '../../config/modelMail';
import { Converssion, convertirMontant } from './Converssion';
import { start } from 'repl';
import { STATUT_COMPTE_ACTIF } from '../models/StatutCompte';
import { COMPTE_COURANT, COMPTE_DEVISE } from '../models/TypeCompte';

var base64 = require('node-base64-image')
let conversion = new Converssion()


export class GestionVirements{

  //Virement entre comptes du meme user
  virementEntreComptes:Express.RequestHandler
      =function (req:Express.Request,res:Express.Response,next:any){
        
    console.log("POST /virement/1")

    let user = req.body.user
    let src = req.body.src
    let dest = req.body.dest
    let montant = req.body.montant
    let motif = req.body.motif
    let justif = req.body.justif  
    // console.log(justif)
    
    console.log(src,"to", dest,montant)    

    if(GestionVirements.isSrcEqualDest(src,dest)){
      res.status(400);
      res.send({
        err:"Bad request",
        msg_err:"La source et dest doivent etre diff" 
      })
    }else{
      GestionVirements.getSeuilVirement(function(seuil:any){
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
              if(!GestionVirements.isCompteActif(comptes[0])
                 || !GestionVirements.isCompteActif(comptes[1])){
                res.status(400);
                res.send({
                  err:"Bad request",
                  msg_err:"L'un des comptes n'est pas actif" 
                })
              }else{
                let indiceSrc=0;
                if(comptes[1].num_compte == src) indiceSrc=1
  
                //Possible: 1->2/3, 2->1, 3->1
                //Interdit: 2<->3
                else if(!GestionVirements.
                  isValidVirementComptesDuMemeClient(
                    comptes[indiceSrc],
                    comptes[1-indiceSrc])){
                  res.status(400);
                  res.send({
                    err:"Bad request",
                    msg_err:"Impossible d'effectuer un virement entre epargne et devise" 
                  })
                }
                else if(comptes[indiceSrc].balance < montant){
                  res.status(400);
                  res.send({
                    err:"Bad request",
                    msg_err:"Vous n'avez pas assez d'argent pour effectuer ce virement" 
                  })
                }
                else{
                  //Générer le code de virement
                  var dateNow = new Date();
                  let code = GestionVirements.genererCodeVir(dateNow,src,dest)
                  // console.log("Code",code)
  
                  //Statut du virement
                  let statut = STATUT_VIR_VALIDE//valide par défaut
                  var filename = ""
                  var photo=null
                  if(+montant>=seuil) {
                    statut=STATUT_VIR_AVALIDER //A valider
                    //Récupérer l'image du justificatif en base64
                    var filnamePath = "./"
                    filename = "assets/justifs/"+code
                    console.log("File",filename);
                    // console.log(justif)
                    base64.decode(new Buffer(justif, 'base64'),
                      {filename: filnamePath+filename},
                      function(err:any){
                        console.log("Fichier")
                        console.log("err "+err);
                       
                    });
                    photo = filename+'.jpg'
                  }
  
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
  
                  //Si 
                  /* if(comptes[0].type_compte == COMPTE_DEVISE 
                    || comptes[1].type_compte == COMPTE_DEVISE){
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
                    }, (error:any)=>{
                      res.status(400);
                      res.send({
                        err:"Error",
                        msg_err:"Impossible de contacter l'API de taux de change" 
                      })
                    })
                  }
                  else { */
                  // console.log(vir)
                  GestionVirements.creerEnregVirement(vir,(created:any)=>{
                    getUserContact(comptes[indiceSrc].id_user, function(user:any){
                      //TODO: indiquer les noms (types) de compte au lieu de numéro
                      MailController
                      .sendMail("no-reply@tharwa.dz",
                        user.email,
                        "Virement entre vos comptes",
                        virEntreComptesMail(user.nom,vir.src,vir.dest,vir.montant))
  
                      res.status(200)
                      res.send(created)
                    }, (err:any)=>{}) 
                  },(error:any)=>{
                    res.status(400);
                    res.send({
                      err:"Error",
                      msg_err:"Impossible d'anvoyer un mail" 
                    })
                  })
                }
              }
            }
          })
        }
      }, (error:any)=>{

      })
      
    }
  }

  //Virement dont la source est THW (destination: THW ou autre)
  public virementSrcTHW:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log("POST /virements/2")

    //TODO: rech dest par email
    let user = req.body.user
    let src = req.body.src
    let dest = req.body.dest
    let montant = req.body.montant
    let motif = req.body.motif
    let justif = req.body.justif  
    console.log(src,"to",dest)
    
    //true si dest thw sinon vers externe
    let virTHW = (dest.substr(0,3)=="THW")

    if(GestionVirements.isSrcEqualDest(src,dest)){
      res.status(400);
      res.send({
        err:"Bad request",
        msg_err:"La source et dest doivent etre diff" 
      })
    }else{
      GestionVirements.getSeuilVirement(function(seuil:number){
        if(+montant>=seuil && !justif){
          res.status(400);
          res.send({
            err:"Bad request",
            msg_err:"Veuillez fournir un justificatif. Le montant dépasse le seuil de non validation" 
          })
        }else{
          console.log('seuil',seuil)
          if(virTHW){
            GestionVirements.virementInterneTharwa({
              user:user,
              src:src,
              dest:dest,
              montant:montant,
              motif:motif,
              justif:justif,
              seuil:seuil
            }, function(done:any){
              res.status(200)
              res.send(done)
            },(error:any)=>{
              res.status(400);
              res.send({
                err:"Bad request",
                msg_err:error
              }) 
            })
          }else{
            //Si le recepteur n'est pas un client de tharwa
            res.status(400);
            res.send({
              err:"Bad request",
              msg_err:"Virement externe." 
            })
          }
        }
      },(error:any)=>{
        res.status(500);
        res.send({
          err:"Erreur base de données",
          msg_err:error
        })
      })
    }
  }

  public static virementInterneTharwa = function(req:any,callback:Function, error:ErrorEventHandler){
      //Vérifier les virements possible; 
      let numComptes = [req.src,req.dest]
      Compte.findAll({
        where:{
          num_compte:{
            $or: numComptes
          },
        }
      }).then((comptes:any)=>{   
      //On a récupéré moins de deux comptes 
      if(comptes.length<2){
        error("Le numéro de compte est erroné" )
      }else {
        let indiceSrc=0;
        if(comptes[1].num_compte == req.src) indiceSrc=1

        if(comptes[indiceSrc].id_user != req.user){
          error("Le compte src n'appartient pas au user" )
        }else if(!GestionVirements.isCompteActif(comptes[0])
                  || !GestionVirements.isCompteActif(comptes[1])){
          error("L'un des comptes n'est pas actif")
        }
        //Vérifier propriétaires diff
        else if(comptes[0].id_user == comptes[1].id_user){
          error("Les comptes emetteur et recepteur appartiennent au meme client" )
        }//Vir Possible: seulement courant <-> courant
        else if(!GestionVirements.isValidVirementEntreClientDiff(comptes[0],comptes[1])){
          error("Impossible d'effectuer un virement entre des comptes non courant")
        }
        else{
          //Vérification de la balance du compte
          if(comptes[indiceSrc].balance < req.montant){
            error("Vous n'avez pas assez d'argent pour effectuer ce virement" )
          }else{
              //Générer le code de virement
              var dateNow = new Date();
              let code = GestionVirements.genererCodeVir(dateNow,req.src,req.dest)
              console.log("Code",code)

              //Statut du virement
              let statut = STATUT_VIR_VALIDE//valide par défaut
              var filename = ""
                var photo=null
                console.log('seuil',req.seuil)
                if(+req.montant>=req.seuil) {
                  statut=STATUT_VIR_AVALIDER //A valider
                  //Récupérer l'image du justificatif en base64
                  var filnamePath = "./"
                  filename = "assets/justifs/"+code
                  console.log("File",filename);
                  // console.log(justif)
                  base64.decode(new Buffer(req.justif, 'base64'),
                    {filename: filnamePath+filename},
                    function(err:any){
                      // console.log("err "+err);
                      
                  });
                  photo = filename+'.jpg'
                }

              GestionVirements.creerEnregVirement({
                code:code,
                montant:req.montant,
                motif:req.motif,
                dateNow:dateNow,
                justif:photo,
                src:req.src,
                dest:req.dest,
                statut:statut
              },function(created:any){
                getUserContact(req.user,
                  function(found:any){
                    let mailSrc=""
                    let mailDest = ""
                    //Envoi mail de notifs
                    MailController
                    .sendMail("no-reply@tharwa.dz",
                      found.email,
                      "Virement émis",
                      virSortantMail(found.nom,req.dest,req.montant))
  
                      callback(created)  
                  }, (err:any)=>{
                    error(err)
                  })
              }, (err:any)=>{
                error(err)
              })   
            }
          }  
        }     
      })
             
  }

  public static getSeuilVirement= function(callback:Function, error:ErrorEventHandler){
    Parametre.findOne({
      where:{id_param:1}
    }).then((result:any)=>{
      if(result){
        callback(+result.valeur)
      }else{
        error('Erreur de récupération du seuil de validation')
      }
      
    });

  }

  public static isSrcEqualDest= function (src:string,dest:string):boolean{
    return (src == dest)
  }

  public static isCompteActif= function(compte:any):boolean{
    return (compte.statut_actuel == STATUT_COMPTE_ACTIF)
  }

  public static isValidVirementEntreClientDiff= function(src:any, dest:any):boolean{
    return (src.type_compte == COMPTE_COURANT && dest.type_compte==COMPTE_COURANT)
  }

  public static isValidVirementComptesDuMemeClient= function(src:any, dest:any):boolean{
    return (src.type_compte == COMPTE_COURANT || dest.type_compte==COMPTE_COURANT)
  }

  public static genererCodeVir = function(date: Date, src:string, dest:string): string{
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

  public static creerEnregVirement= function(vir:any, callback:Function,error:ErrorEventHandler){
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
      if(created){
        callback(created)
      }else{
        error( 'Impossible de créer le virement')
      } 
    })
  }

  /* Partie Banquier */
  //Récupérer les virement à valider
  public getVirementAValider:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
  
    let statut = req.param('statut')
    console.log("GET /virements?statut="+statut)
    GestionVirements.isValidStatutVir(statut, function(result:any){
    Virement.findAll({
      where:{
        statut_virement:STATUT_VIR_AVALIDER
      }
    }).then((results:any)=>{
      res.status(200)
      res.send(results) 
    })
    }, (error:any)=>{
    res.status(400);
    res.send({
      err:"Bad request",
      msg_err:error
    })
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
    GestionVirements.isValidStatutVir(statut, function(result:any){
      Virement.findAll({
        where:{
          statut_virement:statut
        }
      }).then((results:any)=>{
        Virement.findOne({
          where:{
            code_virement:codeVir
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
                  res.status(200)
                  res.send("OK")      
                })
            })

          }
        })
      })
      }, (error:any)=>{
      res.status(400);
      res.send({
        err:"Bad request",
        msg_err:error
      })
    }) 
  }

  public static isValidStatutVir = function(statut:any, callback:Function, error:ErrorEventHandler){
    StatutVirement.findOne({ 
      where:{
        id_statut:statut
      }
    }).then((result:any)=>{
      if(result){
        callback(true)
      }else{
        error('Statut compte erroné')
      }
    })
  }

}

