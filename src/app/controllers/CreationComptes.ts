import * as Express from 'express'
import {Userdb} from '../../oauth2Server/models/User'
import {Fonction} from '../../oauth2Server/models/Fonction'
import {Compte} from '../../app/models/Compte'
import { AvoirStatut } from '../models/AvoirStatut';
import {Parametre} from '../models/Pametres'

import {GestionComptes} from './GestionComptes'

var crypto = require('crypto')
var base64 = require('node-base64-image')

const gestionComptes = new GestionComptes();

export class CreationComptes{

  //To remove
  image:Express.RequestHandler=function(req,res){
    base64.decode(new Buffer(req.body.photo, 'base64'),{filename:"D:/katy.jpg"},
      function(err:any,text:any){
        console.log(text);
    });
    console.log("Test")
    res.send("Allo")
  }
  
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
          error_description:"L'utilisateur existe déjà"
        })
      }else{
        //Le user n'existe pas, le créer
        console.log("User !exists")

        //Vérifier si la fonction existe
        Fonction.findAll({
          where:{id: req.body.fonction}
        }).then((result:any)=>{
          if(!result){
            res.status(200);
            res.send({
              err:"Bad request",
              err_msg:"Le champ fonction est invalide"
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
        ////////Vérfier avec un validateur les champs de la requetes
        //Créer le user
        
      }
    });
  }



/*   public static creerCompteBank (userId:any){
    //Ajouter le compte bancaire
    //let numCompte = this.getNumeroCompte()
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
        console.log(numSeq)
        
        result.valeur = numSeq
        result.save()

        var numCompte = "THW"+numSeq+"DZD"
        console.log(numCompte)
        
        console.log("Here "+numCompte)
        Compte.create({
          num_compte: numCompte,
          balance: 0.0,
          code_monnaie:"DZD",
          type_compte: 1,
          id_user:userId
        }).then( (created:any) =>{
          console.log(created.dataValues) 
          //Ajouter le statut
          AvoirStatut.create({
            num_compte: created.num_compte,
            id_statut: 1,
          }).then( (result:any) => {
              return true
          });
        });
      }
    });      
}

  public static getNumeroCompte(){
    var numSeq
    var numCompte
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
        console.log(numSeq)
        
        result.valeur = numSeq
        result.save()

        var numCompte = "THW"+numSeq+"DZD"
        console.log(numCompte)
        return numCompte;
      }
    });    
  } */
}