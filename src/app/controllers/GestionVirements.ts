import * as Express from 'express'
import { sequelize, Sequelize } from '../../config/db';
import {Parametre} from '../models/Parametre'
import {Compte} from '../models/Compte'
import {Virement} from '../models/Virement'
import {Userdb, getUserContact} from '../../oauth2Server/models/User'
import {StatutVirement, STATUT_VIR_VALIDE, STATUT_VIR_AVALIDER, STATUT_VIR_REJETE} from '../models/StatutVirement'

import { MailController } from './mailController';
import {virEntreComptesMail, 
        virSortantMail,
        validationVirEntreComptesMail,rejetVirEntreComptesMail,
        validationVirSortantMail,rejetVirSortantMail, virEntreComptesAValiderMail, virSortantAValiderMail, virRecuMail, nouveauVirAValiderNotifBanquier } from '../../config/messages';
import { modeleMail } from '../../config/modelMail';
import { Converssion, convertirMontant } from './Converssion';
import { start } from 'repl';
import { STATUT_COMPTE_ACTIF } from '../models/StatutCompte';
import { COMPTE_COURANT, COMPTE_DEVISE, typeCompteString, COMPTE_EPARGNE } from '../models/TypeCompte';
import { CommissionVirement } from '../models/CommissionVirement';
import { getMessageErreur } from '../../config/errorMsg';
import { logger } from '../../config/logger';
import { creerNotif } from './GestionComptes';

var base64 = require('node-base64-image')
let conversion = new Converssion()


export class GestionVirements{

  public getSeuil:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any) {
    console.log('/virements/seuil')
    GestionVirements.getSeuilVirement(function(seuil:any){
      res.status(200);
      res.send({
        seuil:seuil
      })
    },(error:any)=>{
      res.status(400);
      res.send({
        err:"Bad request",
        code_err:error,
        msg_err:getMessageErreur(error)
      })
    })
  }
  //Virement entre comptes du meme user
  public virementEntreComptes:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){    
    console.log("POST /virement/1")

    let user = req.body.user
    let src = req.body.src
    let dest = req.body.dest
    let montant = req.body.montant
    let motif = req.body.motif
    
    console.log(src,"to", dest,montant,user)    

    if(GestionVirements.isSrcEqualDest(src,dest)){
      res.status(400);
      res.send({
        err:"Bad request",
        code_err:'V03',
        msg_err:getMessageErreur('V03')
      })
    }else{
      let numComptes = [src,dest]
      Compte.findAll({
        where:{
          num_compte:{
            $or: numComptes
          },
          id_user: user
        }
      }).then((comptes:any)=>{
        // console.log(comptes.length)
        if(comptes.length<2){
          res.status(400);
          res.send({
            err:"Bad request",
            code_err:'V01',
            msg_err:getMessageErreur('V01')
          })
        }else{
          //Si un des comptes n'est pas actif
          //TODO: plus d'infos de quels compte n'est pas actif
          if(!GestionVirements.isCompteActif(comptes[0])
              || !GestionVirements.isCompteActif(comptes[1])){
                logger.taglog('debug','Virement refuse','compte inactif ',['Virement','refuse'])
            res.status(400);
            res.send({
              err:"Bad request",
              code_err:'V02',
              msg_err:getMessageErreur('V02')
            })
          }else{
            let indiceSrc=0;
            if(comptes[1].num_compte == src) indiceSrc=1

            //Vérifier les virements possibles
            //Possible: 1->2/3, 2->1, 3->1
            //Interdit: 2<->3
            if(!GestionVirements.
              isValidVirementComptesDuMemeClient(
                comptes[indiceSrc],
                comptes[1-indiceSrc])){
                res.status(400);
                res.send({
                  err:"Bad request",
                  code_err:'V04',
                  msg_err:getMessageErreur('V04')
                })
            }
            else if(comptes[indiceSrc].balance < montant){
              res.status(400);
              logger.taglog('debug','Virement refuse','solde insuffisante',['Virement','refuse'])
              res.send({
                err:"Bad request",
                code_err:'V05',
                msg_err:getMessageErreur('V05')
              })
            }
            else{
              //Générer le code de virement
              var dateNow = new Date();
              let code = GestionVirements.genererCodeVir(dateNow,src,dest)
              // console.log("Code",code)

              //Statut du virement
              let statut = STATUT_VIR_VALIDE//valide par défaut
              let vir = {
                code:code,
                montant:+montant,
                motif:motif,
                dateNow:dateNow,
                justif:null,
                src:src,
                dest:dest,
                statut:statut,
                user: comptes[indiceSrc].id_user, //indiceSrc=0??
              }
              // console.log(vir)
              
              GestionVirements.creerEnregVirement(vir,(created:any)=>{
                getUserContact(comptes[indiceSrc].id_user, function(user:any){
                  var srcCompteString =  typeCompteString(comptes[indiceSrc].type_compte)
                  var destCompteString = typeCompteString(comptes[1-indiceSrc].type_compte)
                  var msg=''
                  
                  var msgCommission=''
                  /* if(comptes[indiceSrc].type_compte == COMPTE_COURANT && 
                    comptes[1-indiceSrc].type_compte == COMPTE_EPARGNE) */
                  GestionVirements.getMontantCommissionVir(vir.code,function(commission:any){
                  console.log('commission montant',commission.montant)

                    logger.taglog('info','Commission Retiree',commission,['Virement','Commission'])
                    if(commission.montant_commission != 0){
                      msgCommission = `<br/>Une commission de `+commission.montant_commission+
                          ` DZD a été retirée de votre compte courant pour ce virement.`
                    }

                    msg = virEntreComptesMail(user.nom,
                      srcCompteString,destCompteString,
                      vir.montant+' '+comptes[indiceSrc].code_monnaie,
                      msgCommission)

                    MailController
                    .sendMail(user.email,
                      "Virement entre vos comptes",msg)

                      creerNotif(comptes[indiceSrc].id_user,
                        "Virement entre vos comptes",
                      'Vous venez d\'effectuer un virement de '+vir.montant+' '+
                      comptes[indiceSrc].code_monnaie+
                      'entre vos comptes '+typeCompteString(comptes[indiceSrc].type_compte)
                    +' et '+typeCompteString(comptes[1-indiceSrc].type_compte))

                  },(error:any)=>{
                    res.status(500);
                    res.send({
                      err:"Error DB",
                      code_err:error,
                      msg_err:getMessageErreur(error)
                    })
                  })
                }, (err:any)=>{
                  res.status(500);
                  res.send({
                    err:"Error",
                    code_err:err,
                    msg_err:getMessageErreur(err)
                  })
                })
                
                res.status(200)
                res.send(created)
              },(error:any)=>{
                logger.taglog('error','Erreur base de donnes ',error,['Virement','error'])

                res.status(400);
                res.send({
                  
                  err:"Error DB",
                  code_err:error,
                  msg_err:getMessageErreur(error)
                })
              })
            }
          }
        }
      })
     
    }
  }

  //Virement dont la source est THW (destination: THW ou autre)
  public virementEntreClientsTharwa:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log("POST /virements/2")

    //TODO: rech dest par email
    let userId = req.body.user
    let src = req.body.src
    let dest = req.body.dest
    let montant = req.body.montant
    let motif = req.body.motif
    let justif = req.body.justif
    let typeDest = req.body.type //|| 'NUM'  //EMAIL
    console.log(src,"to",dest,typeDest)
    
    //true si dest thw sinon vers externe
    let virTHW = (dest.substr(0,3)=="THW")

    if(typeDest == 'MICRO' && montant>5000){
      res.status(400);
        res.send({
        err:"Bad request",
        code_err:'V15',
        msg_err:"Virement NFC ne peut pas dépasser 5000 DZD"
      })
      return;
    }
    //Récupérer le seuil de validation
    GestionVirements.getSeuilVirement(function(seuil:number){
      if(+montant>=seuil && !justif){
        res.status(400);
        res.send({
          err:"Bad request",
          code_err:'V06',
          msg_err:getMessageErreur('V06')
        })
      }else{
        //Si dest est un email, on cherche le compte courant du user
        if(typeDest=='EMAIL'){
          // console.log('EMAIL')
          Userdb.findOne({
            where:{
              email:dest
            },
            attributes:['id']
          }).then((user:any)=>{
            if(!user){
              res.status(400);
              res.send({
                err:"Bad Request",
                code_err:'U04',
                msg_err:getMessageErreur('U04')
              })
            }else{
              if(user.id == userId){
                res.status(400);
                res.send({
                  err:"Bad Request",
                  code_err:'V07',
                  msg_err:getMessageErreur('V07')
                })
              }else{
                Compte.findOne({
                  where:{
                    id_user:user.id,
                    type_compte:COMPTE_COURANT
                  },
                  attributes:['num_compte']
                }).then((compte:any)=>{
                  if(!compte){
                    res.status(400);
                    res.send({
                      err:"Bad Request",
                      code_err:'V08',
                      msg_err:getMessageErreur('V08')
                    })
                  }else{
                    dest = compte.num_compte
                    console.log('dest: ',dest)
                    GestionVirements.virementInterneTharwa({
                      user:userId,
                      src:src,
                      dest:dest,
                      montant:montant,
                      motif:motif,
                      justif:justif,
                      seuil:seuil
                    }, function(done:any){
                      console.log('OUT')
                      res.status(200)
                      res.send(done)
                    },(error:any)=>{
                      res.status(400);
                      res.send({
                        err:"Bad request",
                        code_err:error,
                        msg_err:getMessageErreur(error)
                      }) 
                    })
                  }
                });
              }
            }
          });
        }
        else{
          GestionVirements.virementInterneTharwa({
            user:userId,
            src:src,
            dest:dest,
            montant:montant,
            motif:motif,
            justif:justif,
            seuil:seuil
          }, function(done:any){
            console.log('OUT')
            res.status(200)
            res.send(done)
          },(error:any)=>{
            res.status(400);
            res.send({
              err:"Bad request",
              code_err:error,
              msg_err:getMessageErreur(error)
            }) 
          })
        }
      }
    },(error:any)=>{
        res.status(500);
        res.send({
          err:"Erreur DB",
          code_err:error,
          msg_err:getMessageErreur(error)
        })
    })
  }

  public static virementInterneTharwa = function(req:any,callback:Function, error:ErrorEventHandler){
    if(GestionVirements.isSrcEqualDest(req.src,req.dest)){
      error('V03') 
    }else{ 
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
      //Un des comptes est erroné 
      if(comptes.length<2){
        error("V10" )
      }else {
        let indiceSrc=0;
        if(comptes[1].num_compte == req.src) indiceSrc=1

        if(comptes[indiceSrc].id_user != req.user){
          error("V11" )
        }else if(!GestionVirements.isCompteActif(comptes[0])
                  || !GestionVirements.isCompteActif(comptes[1])){
          error("V02")
        }
        //Vérifier propriétaires diff
        else if(comptes[0].id_user == comptes[1].id_user){
          error("V09" )
        }//Vir Possible: seulement courant <-> courant
        else if(!GestionVirements.isValidVirementEntreClientDiff(comptes[0],comptes[1])){
          error("V04")
        }
        else{
          //Vérification de la balance du compte
          if(comptes[indiceSrc].balance < req.montant){
            error("V05" )
          }else{
              //Générer le code de virement
              var dateNow = new Date();
              let code = GestionVirements.genererCodeVir(dateNow,req.src,req.dest)
              // console.log("Code",code)

              //Statut du virement
              let statut = STATUT_VIR_VALIDE//valide par défaut
              var filename = ""
                var photo=null
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
                    //Envoi mail de notifs
                    let msg = ''
                    let msgCommission=''
                    //Récupérer la commission
                    GestionVirements.getMontantCommissionVir(created.code_virement,function(commission:any){
                      console.log(commission.dataValues)
                      if(commission.montant_commission != 0){
                        msgCommission = `Une commission de `+commission.montant_commission+
                            ` DZD a été retirée de votre compte courant pour ce virement.`
                      }

                      if(created.statut_virement == STATUT_VIR_VALIDE){
                        msg = virSortantMail(found.nom,req.dest,req.montant,msgCommission) 
                      }else {
                        msg = virSortantAValiderMail(found.nom,req.dest,req.montant,msgCommission)
                      }
                      // console.log(msgCommission)
                      MailController
                          .sendMail(found.email,
                            "Virement émis",
                            msg)

                      creerNotif(comptes[indiceSrc].id_user,"Virement émis",
                      'Vous venez d\'effectuer un virement de '+req.montant+' DZD vers '+
                    'le compte '+req.dest)

                    },(err:any)=>{
                      console.log(err)
                      error(err)
                    }) 
                  }, (err:any)=>{
                    console.log(err)
                    error(err)
                  })

                  //Envoi mail de notifs au recepteur
                  if(created.statut_virement == STATUT_VIR_VALIDE){
                    getUserContact(comptes[1-indiceSrc].id_user,
                      function(found:any){
                        console.log(found.nom)
                        MailController
                        .sendMail(found.email,
                          "Virement reçu",
                          virRecuMail(found.nom,req.src,req.montant)) 

                      creerNotif(comptes[1-indiceSrc].id_user,"Virement reçu",'Vous venez de recevoir un '+
                      'virement de '+req.montant+' DZD depuis le compte '+req.src
                      )

                      }, (err:any)=>{
                        error(err)
                      })
                  }else{
                    notifierBanquierNouveauVirAValider()
                  }
                  
                  callback(created)  
              }, (err:any)=>{
                error(err)
              })   
            }
          }  
        }     
      })
             
  
    }
  }

  public static getSeuilVirement= function(callback:Function, error:ErrorEventHandler){
    Parametre.findOne({
      where:{id_param:1}
    }).then((result:any)=>{
      if(result){
        callback(+result.valeur)
      }else{
        error('D07')
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
        logger.taglog('info','Nouveau Virement',Virement,['Virement','Nouveau Virement'])
        callback(created)
      }else{
        error( 'D05')
      } 
    }).catch(Sequelize.ValidationError, function (err:any) {
      console.log(err.errors)
      error('D06')
    });
  }

  public static getMontantCommissionVir = function(codeVir:any, callback:Function,error:ErrorEventHandler){
    CommissionVirement.findOne({
      where:{
        id_virement:codeVir
      }
    }).then((commission:any)=>{
      if(!commission) error('D04')
      else{
        callback(commission)
      }
    })
  }

  /* Partie Banquier */
  //Récupérer les virement à valider
  public getVirementAValider:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    let statut = req.query.statut //param('statut')
    console.log("GET /virements?statut="+statut)
    GestionVirements.isValidStatutVir(statut, function(result:any){
      Virement.findAll({
        where:{
          statut_virement:STATUT_VIR_AVALIDER
        }
      }).then((results:any)=>{
        var virs:any = []
        if(results.length == 0){
          res.status(200)
          res.send(results)
          return;
        }
        results.forEach((vir:any) => {
          GestionVirements.getVirSrcDest({
            src:vir.emmetteur,
            dest:vir.recepteur
          },function(users:any){
            virs.push({
              vir:vir,
              emetteur:users.emetteur,
              recepteur:users.recepteur
            })

            if(virs.length == results.length){
              res.status(200)
              res.send(virs)
            }
          },(err:any)=>{

          })  
        });        
      })
    }, (error:any)=>{
      res.status(400);
      res.send({
        err:"Bad request",
        code_err:error,
        msg_err:getMessageErreur(error)
      })
    }) 
  }

  public static getVirSrcDest = function(vir:any,callback:Function,error:ErrorEventHandler){
    Compte.findAll({
      where:{
        num_compte:{
          $or:[vir.src,vir.dest]
        }
      }
    }).then((comptes:any)=>{
      if(comptes){
        let indiceSrc = 0
        if(comptes[1].num_compte == vir.src) indiceSrc=1
        Userdb.findAll({
          where:{
            id:{
              $or:[comptes[0].id_user,comptes[1].id_user]
            }
          },
          attributes:['nom','prenom','photo','adresse','email']
        }).then((users:any)=>{
          if(users){
            let indiceUserSrc = 0
            if(users[1].id == comptes[indiceSrc].id_user) indiceUserSrc=1
            callback({
              emetteur:users[indiceUserSrc],
              recepteur:users[1-indiceUserSrc]
            })
          }else{
            error('Users not found')
          }
        })
      }else{
        error('Comptes not found')
      }
    })
  }
  //Valider un virement
  public modifStatutVir:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    let statut = req.body.statut
    let motif = req.body.motif
    console.log('statut',statut,'motif',motif)

    let codeVir = req.params.codeVir
    console.log("PUT virements/"+codeVir)

    
    GestionVirements.isValidStatutVir(statut, function(result:any){
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
              code_err:'V12',
              msg_err: getMessageErreur('V12')
            })
          }else{
            //Vérifier que le changement du statut du virement est valide
            if(!GestionVirements.isValidChangementStatut(virement.statut_virement,statut)){

              res.status(400)
              res.send({
                err:"Bad request",
                code_err:'V13',
                msg_err: getMessageErreur('V13')
              })
            }else{
              //Vérifier que le motif est fourni en cas de rejet
              if(statut == STATUT_VIR_REJETE && !motif){
                logger.taglog('warn','Rejet sans motif',virement,['Virement','Rejet annule'])
                res.status(400)
                res.send({
                  err:"Bad request",
                  code_err:'V14',
                  msg_err: getMessageErreur('V14')
                })
              }else {
                 //Modifier statut du virement: valider ou rejeter
                 logger.taglog('info','Virement '+statut,virement,['Virement','Changement Statut'])
 
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
                    let msgCommission = ''

                    getUserContact(comptes[indiceSrc].id_user,function(user:any){
                      if(statut==STATUT_VIR_VALIDE){
                          objetMail = "Validation virement"
                          msg= validationVirSortantMail(user.nom,comptes[1-indiceSrc].num_compte,
                          virement.montant)

                          creerNotif(user.id,objetMail,
                          'Votre virement vers le compte '+comptes[1-indiceSrc].num_compte+
                         ' a été validé')

                      }else if(statut == STATUT_VIR_REJETE){
                        objetMail = "Rejet virement"
                        msg = rejetVirSortantMail(user.nom,virement.emmetteur, 
                            motif)
                        creerNotif(user.id,objetMail,
                          'Votre virement vers le compte '+comptes[1-indiceSrc].num_compte+
                          ' a été rejeté')
                      }
                      MailController
                        .sendMail(user.email,
                          objetMail,msg
                        )

                      
                    },(error:any)=>{
                      res.status(400)
                      res.send({
                        err:"Bad request",
                        code_err:error,
                        msg_err:getMessageErreur(error)
                      })
                    })

                    //Envoyer mail au recepteur
                    if(statut== STATUT_VIR_VALIDE && comptes[0].id_user != comptes[1].id_user){
                      getUserContact(comptes[1-indiceSrc].id_user,function(user:any){
                        MailController
                        .sendMail(user.email,
                          'Virement reçu',
                          virRecuMail(user.nom,virement.emmetteur,virement.montant)
                        )

                        creerNotif(user.id,'Virement reçu',
                        'Vous venez de recevoir un virement de '+virement.montant+
                        ' depuis le compte'+virement.emmetteur)

                      },(error:any)=>{
                        res.status(400);
                        res.send({
                          err:"Bad request",
                          code_err:error,
                          msg_err:getMessageErreur(error)
                        })
                      })
                    }

                    res.status(200)
                    res.send("OK")      
                  })
              }
            }
          }
        })
      }, (error:any)=>{
        res.status(400);
        res.send({
          err:"Bad request",
          code_err:error,
          msg_err:getMessageErreur(error)
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
        error('V15')
      }
    })
  }

  public static isValidChangementStatut = function(oldStatut:number, newStatut:number):boolean{
    return (oldStatut==STATUT_VIR_AVALIDER && newStatut==STATUT_VIR_VALIDE)
          || (oldStatut==STATUT_VIR_AVALIDER && newStatut==STATUT_VIR_REJETE)
  }

}

function notifierBanquierNouveauVirAValider(){

  
  Userdb.findAll({
    where:{
      fonctionId:'B'
    }
  }).then((banquiers:any)=>{
    banquiers.forEach((banquier:any) => {
      MailController
      .sendMail(banquier.email,"Nouveau virement à valider",
      nouveauVirAValiderNotifBanquier())

    });
  })
}

