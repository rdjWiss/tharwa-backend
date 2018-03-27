import * as Express from 'express'
import {Userdb} from '../../oauth2Server/models/User'
import {Compte} from '../../app/models/Compte'
import { AvoirStatut } from '../models/AvoirStatut';
import { sequelize } from '../../config/db';
import { stat } from 'fs';
import { MailController } from './mailController';
import { verificationMail, validationCompteUserMail } from '../../config/messages';
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

          //A changer par un acces à la bdd
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
    console.log("PU comptes/"+numCompte)
    //Vérifier que le statut fait partie des statuts considérés
    //Vérifier que seule les banquiers peuvent executer cette fonction
    //Vérifier si de bloqué vers actif ou vs motif obligatoire
    //Vérifier les passage possible entre statut

    //Vérifier que le statut n'est pas null
    if(statut == null ){
      res.status(400)
      res.send({
        err:"Bad request",
        err_msg: ""
      })
    }
    console.log(numCompte)

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
            err:"Not modified"
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
              attributes:['statut_actuel','id_user','num_compte']
            }).then((compte:any)=>{
              var ancienStat = compte.statut_actuel
              compte.statut_actuel = statut
              compte.save() //l'enregistrer
              console.log("statut actuel "+compte.statut_actuel)

              //Rechercher le user et lui envoyé un mail
              Userdb.findOne({
                where:{id: compte.id_user},
                attributes:['active','id','nom','email']
              }).then((user:any)=>{
                if(user){
                  //Si c'est le premier compte (courant) du user, activer son compte
                  if(ancienStat == "1"){
                    user.active = "TRUE"
                    user.save()
                    console.log(user.email)
                    MailController
                      .sendMail("no-reply@tharwa.dz",
                        user.email,"Validation compte THARWA",
                        //validationCompteUserMail(user.nom))
                        validationCompteUserMail(user.nom))
                      .then(()=>{
                        console.log("Mail Sent")
                        res.status(200)
                        res.send(result)
                      }).catch((error:any)=>{
                        console.log(error)
                        console.log("Impossible d'envoyer le code.")
                          res.status(500)
                          res.send("Impossible d'envoyer le code. ")
                      })
                  }else{
                    //Création d'un autre compte bancaire
                    
                  }
                  
                }else{
                  res.status(401)
                  res.send({
                    err:""
                  })
                }
              })
            })
          });
        }
      }else { 
        res.status(404)
        res.send({
          err:"Compte not found",
          code_err:""
        })
      }
    })
    

  }
}

//Vérifier que seule les banquiers peuvent executer cette fonction
    //Vérifier que le statut est légal
    
   /* AvoirStatut.findAll({
      where:{
        id_statut:statut
      }, :true
    })*/
    //AvoirStatut.findAll({
      /* where : {
        id_statut : statut
      }, */
      /* attributes:[ 'num_compte',
      [sequelize.fn('max',sequelize.col('date_statut')),'maximum']], 
     
      group: ['num_compte'], */
      //having:['id_statut = ?',statut]
      
    //})
     /*let comptes:Array<string> = []
        results.forEach((element:any) => {
          comptes.push(element.num_compte)
        });
        Compte.findAll({
          where:{
            num_compte:{
              $or: comptes
            }
          },
          attributes: ['num_compte', 'type_compte', 'code_monnaie', 'id_user']
        }).then((results:any) =>{
          if(results){ */
             /*
/*  console.log(element.dataValues)
          AvoirStatut.findOne({
            attributs:['id_statut'],
            where:{ num_compte: element.num_compte, date_statut:element.maximum}
          }).then((statut:any)=>{
            if(statut && statut.id_statut== 1) {comptes.push(element.num_compte)
            console.log(statut.id_statut)
            console.log(element.num_compte)}
            else console.log('nope')
          }) */
        //});
        /* setTimeout(function() {
          res.status(200)
          res.send(comptes) 
        }, 100)
        return; */
  