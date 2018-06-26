import * as Express from 'express'
import {Userdb} from '../../oauth2Server/models/User'
import {Compte} from '../../app/models/Compte'
import { AvoirStatut } from '../models/AvoirStatut';
import {statutComptes, STATUT_COMPTE_REJETE, STATUT_COMPTE_BLOQUE, STATUT_COMPTE_AVALIDER, STATUT_COMPTE_ACTIF} from '../models/StatutCompte'
import { sequelize } from '../../config/db';
import { stat } from 'fs';
import { MailController } from './mailController';
import { verificationMail, validationCompteUserMail, rejetCompteUserMail,
  validationCompteBankMail,rejetCompteBankMail, blocageCompteBankMail, nouvelleDemandeCreationCompteNotifBanquier, nouvelleDemandeDeblocageCompteNotifBanquier, deblocageCompteBankMail, verificationMessage, commissionGestionMail } from '../../config/messages';
import { COMPTE_EPARGNE, COMPTE_DEVISE, COMPTE_COURANT, typeCompteString } from '../models/TypeCompte';
import { getMessageErreur } from '../../config/errorMsg';
import { Virement } from '../models/Virement';
import { CommissionVirement } from '../models/CommissionVirement';
import { getTypeCommission } from '../models/Commission';
import { DemandeDeblocage } from '../models/DemandeDeblocage';
import { Notification } from '../models/Notification';
import { CommissionMensuelle } from '../models/CommissionMensuelle';
const Sequelize = require('cu8-sequelize-oracle');

const VIR_ENTRE_COMPTES ='VEC'
const VIR_EMIS = 'VE'
const VIR_RECU = 'VR'

export class GestionComptes{

  public userExist:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    console.log('GET comptes/'+req.params.userEmail)
    
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
    console.log("GET /comptes/"+id_user+"/comptes")

    Userdb.findOne({
      where:{
        id:id_user
      }
    }).then((user:any)=>{
      if(!user){
        res.status(400);
        res.send({
          err:"Bad request",
          code_err:'U03',
          msg_err:getMessageErreur('U03')
        })
      }else{
        Compte.findAll({
          where:{
            id_user:id_user
          }
        }).then((comptes:any)=>{
          // console.log(comptes)
          if(comptes){
            comptes.forEach((compte:any) => {
              console.log('Compte',compte.num_compte)
              DemandeDeblocage.findOne({
                where:{ num_compte : compte.num_compte},
                attributes:['date_demande','justif','num_compte']
              }).then((found:any)=>{
                  if(found){
                    console.log(found.dataValues)
                    compte.dataValues.demande = true
                  }
      
                  if(compte == comptes[comptes.length-1]){
                    res.status(200)
                    res.send({ comptes: comptes} )
                  }
                
              })
            });
            
          }
        })
      }
    })
  }

  //Récupérer les comptes d'un statut donné
  public getComptes:Express.RequestHandler=(req:Express.Request,res:Express.Response,next:any)=>{
    let statut = parseInt(req.query.statut)
    console.log("GET /comptes?statut="+statut)
    
    if(statutComptes.indexOf(statut) == -1){
      res.status(400);
      res.send({
        err:"Bad request",
        code_err:'C06',
        msg_err:getMessageErreur('C06')
      })
    }else{
      //Rechercher les comptes dont le statut actuel = statut voulu
      Compte.findAll({
        where:{
          statut_actuel: statut
        },attributes:['num_compte', 'type_compte', 'code_monnaie', 'id_user','statut_actuel']
      }).then((results:any) =>{
        if(results){
          var comptes:any = []
          //Récupérer les id des comptes des comptes concernés
          if(results.length != 0){
            results.forEach((element:any) => {              
              element.type_compte = typeCompteString(element.type_compte)
  
              Userdb.findOne({
                where:{
                  id:element.id_user
                },
                attributes: ['id', 'nom', 'prenom', 'photo','email','fonctionId','adresse','telephone']
              }).then((user:any)=>{
                
                element.user = user
                if(!user) console.log("user",user,element.id_user)
                comptes.push({
                  compte:element.dataValues,
                  user:user.dataValues
                  
                })
  
                if(comptes.length == results.length){
                  console.log()
                  if(statut != STATUT_COMPTE_BLOQUE){
                    res.status(200)
                    res.send(comptes) 
                  }else{
                    this.getCompteBloque(comptes,(comptes:any)=>{
                      res.status(200)
                      res.send(comptes) 
                    })
                  }
                  
                }
              });
            });
          }else{
            res.status(200)
            res.send(comptes)
          }      
        }else{
          res.status(404);
          res.send({
            error: "Erreur DB",
            code_err:'D01',
            error_msg:"Impossible de récupérer les comptes"
          })
        }
      });
    }
    
    
  }

  public getCompteBloque=(comptes:any,callback:Function)=>{

      comptes.forEach((compte:any) => {
        // console.log('Compte',compte.compte.num_compte)
        DemandeDeblocage.findOne({
          where:{ num_compte : compte.compte.num_compte},
          attributes:['date_demande','justif','num_compte']
        }).then((found:any)=>{
            if(found){
              compte.demande = found.dataValues
            }

            this.getStatutBlocage(compte.compte.num_compte, function(statut:any){
              if(statut) compte.statut = statut

              if(compte == comptes[comptes.length-1]){
                callback(comptes)
              }
            })
        })
      });

  }

  public getStatutBlocage=function(numCompte:any, callback:Function){
    AvoirStatut.findOne({
      where : {
        id_statut : STATUT_COMPTE_BLOQUE,
        num_compte: numCompte
      },
      attributes:[ 'num_compte',
      [sequelize.fn('max',sequelize.col('date_statut')),'date_statut']], 
      
      group: ['num_compte']
           
    }).then((result:any)=>{
      if(!result) callback(null)
      else{
        AvoirStatut.findOne({
          where:{
            id_statut : STATUT_COMPTE_BLOQUE,
            num_compte: numCompte,
            date_statut : result.date_statut
          }
        }).then((found:any)=>{
          // console.log(found.dataValues)
          callback(found)
        })
      }
      
    })
  }

  //Modifier le statut d'un compte bancaire
  public modifCompte:Express.RequestHandler= (req:Express.Request,res:Express.Response,next:any)=>{
    
    let statut = req.body.statut
    let motif = req.body.motif

    let numCompte = req.params.numCompte
    console.log("PUT comptes/"+numCompte,statut)
    
    //TODO: Vérifier que seule les banquiers peuvent executer cette fonction 

    //Vérifier que le statut fait partie des statuts considérés et non null
    if(statut == null || statutComptes.indexOf(+statut) == -1 ){
      res.status(400)
      res.send({
        err:"Bad request",
        code_err:"C06",
        msg_err: getMessageErreur('C06')
      })
    }
    else{
      Compte.findOne({
        where:{
          num_compte:numCompte
        }
      }).then((result:any)=>{
        if(result){
          // if(!GestionComptes.isValidChangementStatut(result.statut_actuel,statut)){
          if(!this.isValidChangementStatut(result.statut_actuel,statut)){ 
            res.status(400)
            res.send({
              err:"Erreur",
              code_err:'C07',
              msg_err:getMessageErreur('C07')
            })
          }  
          else{
            //Les modifications nécessitant un motif
            if(this.isChangementStatutNecessitantMotif(result.statut_actuel,statut) 
                && motif==null){
              res.status(400)
              res.send({
                err:"Erreur",
                code_err:'C08',
                msg_err:getMessageErreur('C08')
              })
            }else {
              //Créer un nouveau statut du compte dans la table AvoirsStatut
              let date = new Date()
              AvoirStatut.create({
                num_compte : numCompte,
                id_statut: statut,
                motif: motif,
                date_statut:date.getTime()
              }).then((result:any) =>{
                console.log(result.dataValues)
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
                            creerNotif(compte.id_user,objetMail,
                              'Votre compte tharwa  a été validé')
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

                            creerNotif(compte.id_user,objetMail,
                              'Votre compte tharwa '+typeCompteString(compte.type_compte)
                            + ' a été validé')
                          }
                        }else if (statut==STATUT_COMPTE_REJETE){
                          if(compte.type_compte == COMPTE_COURANT){
                            message = rejetCompteUserMail(user.nom,motif)
                            objetMail = "Rejet compte THARWA"

                            creerNotif(compte.id_user,objetMail,
                              'Votre compte tharwa a été rejeté')
                          }else{
                            //TODO: validation d'un autre compte bancaire, le msg est diff
                            if(compte.type_compte==COMPTE_EPARGNE){
                              message = rejetCompteBankMail(user.nom,"épargne",motif)
                            }else if(compte.type_compte==COMPTE_DEVISE){
                              message = rejetCompteBankMail(user.nom,"devise",motif)
                            }
                            objetMail = "Rejet création compte bancaire THARWA"

                            creerNotif(compte.id_user,objetMail,
                              'Votre compte tharwa '+typeCompteString(compte.type_compte)
                            + ' a été rejeté')
                          }
                        }

                        MailController
                        .sendMail(user.email,objetMail,
                          message)

                        res.status(200)
                        res.send(result)
                      }else if(statut == STATUT_COMPTE_BLOQUE){
                          objetMail = "Compte tharwa bloqué"
                          message = blocageCompteBankMail(user.nom,
                              typeCompteString(compte.type_compte),motif)

                          MailController
                          .sendMail(user.email,objetMail,
                            message)

                            creerNotif(compte.id_user,objetMail,
                              'Votre compte tharwa '+typeCompteString(compte.type_compte)
                            + ' a été bloqué')
  

                          res.status(200)
                          res.send({})
                      }else if(statut == STATUT_COMPTE_ACTIF){
                        //Déblocage d'un compte 

                        //Si demande de déblocage la supprimer
                        this.accepterDemandeDeblocage(compte.num_compte,(result:any)=>{
                          //Envoyer un mail au user
                          objetMail = "Compte tharwa débloqué"
                          message = deblocageCompteBankMail(user.nom,
                              typeCompteString(compte.type_compte),motif)

                          MailController
                          .sendMail(user.email,objetMail,
                            message)

                            creerNotif(compte.id_user,objetMail,
                            'Votre compte tharwa '+typeCompteString(compte.type_compte)
                          + ' a été débloqué')

                          res.status(200)
                          res.send({})
                        }) 
                      } 
                    }else{
                      res.status(401)
                      res.send({
                        err:"Not Found",
                        code_err:'U03',
                        msg_err:getMessageErreur('U03')
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
            code_err:'C00',
            msg_err:getMessageErreur('C00')
          })
        }
      })
    }

  }

  public  isValidChangementStatut = function(ancienStatut:any, nouveauStatut:any):boolean{
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

  public isChangementStatutNecessitantMotif = function(ancienStatut:any, nouveauStatut:any):boolean{
    return  (nouveauStatut == STATUT_COMPTE_REJETE 
          || nouveauStatut == STATUT_COMPTE_BLOQUE 
          || (ancienStatut == STATUT_COMPTE_BLOQUE && nouveauStatut == STATUT_COMPTE_ACTIF)) 
  }

  public accepterDemandeDeblocage = function(numeroCompte:String,callback:Function){
    //Rechercher si une demande de déblocage existe
    DemandeDeblocage.destroy({
      where:{num_compte:numeroCompte}
    }).then((destroyed:any)=>{
      callback()
    })
  }

  //Récupérer l'historique d'un user (de tout ses comptes)
  public getHistorique:Express.RequestHandler= (req:Express.Request,res:Express.Response,next:any)=>{
    let self = this
    let user = parseInt(req.query.user)//req.user;
    console.log('GET Historique?user= ',user)

    //Trouver les comptes de user
    Compte.findAll({ where: { id_user:user } })
    .then((comptes:any)=>{
      if(comptes){
        let numComptes:Array<string> = []
        comptes.forEach((compte:any) => {
          numComptes.push(compte.num_compte)
          if(numComptes.length == comptes.length){
            self.getHistoriqueVir(self,numComptes,comptes, function(historique:Array<any>, codesVir:any){
              if(historique.length != 0){
                self.getHistoriqueCommissionVir(codesVir, function(commissions:Array<any>){
                  historique =  historique.concat(commissions)
                  self.getHistoriqueCommissionGestion(numComptes,function(commissions:any){
                    historique =  historique.concat(commissions)
                    historique = historique.sort((a:any, b:any)=>{
                      return (a.dataValues.date > b.dataValues.date)? -1 : 1
                    })
                    res.status(200)
                    res.send(historique)
                  },(err:any)=>{
                    res.status(500)
                  res.send({
                    err:"Erreur DB",
                    code_err:err,
                    msg_err: getMessageErreur(err)
                  })
                  })  
                },(err:any)=>{
                  res.status(500)
                  res.send({
                    err:"Erreur DB",
                    code_err:err,
                    msg_err: getMessageErreur(err)
                  })
                })
              }else{
                res.status(200)
                res.send(historique)
              }
            }, (err:any)=>{
              res.status(500)
              res.send({
                err:"Erreur DB",
                code_err:err,
                msg_err: getMessageErreur(err)
              })
            })    
          }
        });
      }else{
        res.status(500)
        res.send({
          err:"Erreur DB",
          code_err:'D10',
          msg_err: getMessageErreur('D10')
        })
      }
    })

    // console.log(user)
  }

  public getTypeVirement= function( listComptesUser:any,src:string,dest:string):string{
    if( listComptesUser.indexOf(src)!=-1 && listComptesUser.indexOf(dest)!=-1 )
      return VIR_ENTRE_COMPTES
    else  if(listComptesUser.indexOf(src)!=-1)
      return VIR_EMIS
    else  if(listComptesUser.indexOf(dest)!=-1)
      return VIR_RECU 
    else return ''
  }

  public getHistoriqueVir = function(classSelf:any,listComptes:Array<string>,
    comptes:any,callback:Function,
    error:ErrorEventHandler) {
      console.log('Get historique virements')
      //Trouver les virements émis ou reçus par ces comptes
      Virement.findAll({
        where:{
          $or:{
            emmetteur:{ $or: listComptes},
            recepteur:{ $or: listComptes}
          }
        },
        order:[
          ['date_virement','DESC']
        ]
    }).then((virements:any)=>{
      if(!virements){
        error('D11')
      }else{
        let nbrVir = virements.length
        let historique:any = []
        let codesVir:Array<string> = []
        if(virements.length != 0)
          virements.forEach((vir:any) => {
            vir.dataValues.type = classSelf.getTypeVirement(listComptes,vir.emmetteur,vir.recepteur)
            vir.dataValues.date = vir.date_virement
            vir.dataValues.montant = vir.dataValues.montant+' '+vir.dataValues.emmetteur.substr(-3)

            historique.push(vir)
            codesVir.push(vir.code_virement)
            // console.log(vir.dataValues)
            if(historique.length == nbrVir){
              callback(historique,codesVir)
            }
          });
        else callback(historique,codesVir)
      }
    })
  }

  public getHistoriqueCommissionVir = function(codesVir:Array<string>, callback:Function,
    error:ErrorEventHandler){
      console.log('Get historique commissions virements')
      CommissionVirement.findAll({
        where:{
          id_virement:{
            $or: codesVir
          }
        },
        order:[
          ['date_commission','DESC']
        ],
        attributes:['id_commission','montant_commission','date_commission']
      }).then((commissions:any)=>{
          if(!commissions){
            error('D04')
          }else{
            if(commissions.length != 0){
              commissions.forEach((commission:any) => {
                  commission.dataValues.type='CV'
                  commission.dataValues.date = commission.date_commission
                  // console.log(getTypeCommission(commission.dataValues.id_commission))
                  commission.dataValues.id_commission = getTypeCommission(commission.dataValues.id_commission)
                  if(commission == commissions[commissions.length - 1]){
                    callback(commissions)
                  }
              });
            }else{
              callback(commissions)
            }
            
          }
      })
  }

  public getHistoriqueCommissionGestion = function(listComptes:Array<string>, callback:Function,
    error:ErrorEventHandler){
      console.log('Get historique commissions gestion')
      CommissionMensuelle.findAll({
        where:{
          num_compte:{
            $or: listComptes
          }
        },
        order:[
          ['date_commission','DESC']
        ],
        attributes:['id_commission','montant_commission','date_commission']
      }).then((commissions:any)=>{
          if(!commissions){
            error('D04')
          }else{
            if(commissions.length != 0){
              commissions.forEach((commission:any) => {
                  commission.dataValues.type='CG'
                  commission.dataValues.date = commission.date_commission
                  // console.log(getTypeCommission(commission.dataValues.id_commission))
                  commission.dataValues.id_commission = getTypeCommission(commission.dataValues.id_commission)
                  if(commission == commissions[commissions.length - 1]){
                    callback(commissions)
                  }
              });
            }else{
              callback(commissions)
            }
            
          }
      })
  }

  //Récupérer les comptes actifs pour BLOCAGE
  public getComptesParFiltrage:Express.RequestHandler= (req:Express.Request,res:Express.Response,next:any)=>{
    let nom = req.query.recherche || ''
    let prenom = req.query.recherche || ''
    let email = req.query.recherche || ''

    console.log('nom',nom,'prenom',prenom,'email',email)
    Compte.findAll({
      where:{
        statut_actuel:STATUT_COMPTE_ACTIF
      },
      include:[
        {
          model:Userdb,
          where:{
            $or:{
              nom:sequelize.where(sequelize.fn('LOWER',sequelize.col('nom')),
              'LIKE','%'+nom+'%'),
              prenom: sequelize.where(sequelize.fn('LOWER',sequelize.col('prenom')),
                  'LIKE','%'+prenom+'%'),
              email:sequelize.where(sequelize.fn('LOWER',sequelize.col('email')),
              'LIKE','%'+email+'%'),
            }
          },
          attributes:['nom','prenom','adresse','telephone','email','photo']
        }
      ],
      attributes:['num_compte','date_creation','statut_actuel','type_compte','code_monnaie','id_user']
    }).then((results:any)=>{
      if(results){
        if(results.length != 0)
        results.forEach((compte:any) => {
          compte.dataValues.type_compte = typeCompteString(compte.dataValues.type_compte)
          // console.log(compte.dataValues.type_compte)
          if(compte == results[results.length-1]){
            res.status(200)
            res.send(results)
          }
        });
        else{
          //Aucun résultat
          res.status(200)
          res.send(results)
        }
      }else {
        //TODO: send error msg
        res.status(400)
        res.send(results)
      }
        
    })

  }

  //Demande de déblocage
  public demandeDeblocage:Express.RequestHandler= (req:Express.Request,res:Express.Response,next:any)=>{
    let self = this
    let user = parseInt(req.query.user)//req.user;
    let numCompte = req.body.num_compte
    let justif = req.body.justif
    console.log('POST /demandeDeblocage',numCompte)

    if(!numCompte || !justif || !user){
      res.status(400)
      res.send({
        err:"Requete invalide",
        code_err:'C09',
        msg_err: getMessageErreur('C09')
      })
    }else{
      Compte.findOne({
        where: {num_compte : numCompte}
      }).then((result:any)=>{
        if(!result){
          res.status(400)
          res.send({
            err:"Requete invalide",
            code_err:'C00',
            msg_err: getMessageErreur('C00')
          })
        }else{
          //Si le compte n'appartient pas au user
          if(result.id_user != user){
            res.status(400)
            res.send({
              err:"Requete invalide",
              code_err:'C10',
              msg_err: getMessageErreur('C10')
            })
          }
          //Si le compte n'est pas bloqué
          else if(result.statut_actuel != STATUT_COMPTE_BLOQUE){
            res.status(400)
            res.send({
              err:"Requete invalide",
              code_err:'C11',
              msg_err: getMessageErreur('C11')
            })
          }else{
            DemandeDeblocage.findOne({
              where:{num_compte:numCompte }
            }).then((found:any)=>{
              if(found){
                res.status(400)
                res.send({
                  err:"Requete invalide",
                  code_err:'C12',
                  msg_err: getMessageErreur('C12')
                })
              }else{
                let date = new Date()
                //Créer la demande
                DemandeDeblocage.create({
                  justif:justif,
                  num_compte:numCompte,
                  date_demande:date.getTime()
                }).then((created:any)=>{
                  if(!created){
                    res.status(400)
                    res.send({
                      err:"Erreur DB",
                      code_err:'D12',
                      msg_err: getMessageErreur('D12')
                    })
                  }else{
                    //Envoyer mail de notifs aux banquiers
                    this.notifierBanquierNouvelleDemandeDeblocage()
                    res.status(200)
                    res.send(created)
                  }
                })
              }
            })
            
            
          }
        }
      })
    }
  }

  public notifierBanquierNouvelleDemandeDeblocage=function(){

    Userdb.findAll({
      where:{
        fonctionId:'B'
      }
    }).then((banquiers:any)=>{
      if(banquiers){
        banquiers.forEach((banquier:any) => {
          MailController
          .sendMail(banquier.email,"Nouvelle demande de déblocage d'un compte Tharwa",
          nouvelleDemandeDeblocageCompteNotifBanquier())
        });
      }
    })
  }

  //Notifications commissions de gestion
  public notifierClientCommissionGestion:Express.RequestHandler= (req:Express.Request,res:Express.Response,next:any)=>{
    console.log('notfier commission gestion',req.body)
    let commissionCourant = parseInt(req.query.courant)
    let commissionEpargne = parseInt(req.query.epargne)
    let commissionDevise = parseInt(req.query.devise)
    let email = req.query.email
    let nom = req.query.nom
    console.log(commissionCourant,commissionEpargne,commissionDevise,email,nom)
    MailController.sendMail(email,'MAIL',commissionGestionMail(nom,'message'))
    res.status(200)
    res.send('ok')
  }

  //Notifications
  public getNotifications:Express.RequestHandler=function (req:Express.Request,res:Express.Response,next:any){
    
    let idUser = req.params.idUser
    console.log('Notifications',idUser)

    Notification.findAll({
      where:{ id_user:idUser}
    }).then((found:any)=>{
      if(!found){
        res.status(400)
        res.send({

        })
      }else{
        if(found.length== 0 ){
          res.status(200)
          res.send({
            notifs:found
          })
        }else{
          // console.log(found)
          let notifsId:any = []
          found.forEach((notif:any) => {
            notifsId.push(notif.id_notif)
            if(notifsId.length == found.length){
              Notification.destroy({
                where:{
                  $or:{
                    id_notif:notifsId
                  }
                }
              }).then(()=>{
                res.status(200)
                res.send({
                  notifs:found
                })
              })
            }
          });
        }
      }
    })

  }
}

export function creerNotif(idUser:number,titre:string,message:string){
  Notification.create({
    id_user:idUser,
    titre:titre,
    message:message
  }).then((created:any)=>{
    console.log('Notification',created.dataValues)
  })
}
  