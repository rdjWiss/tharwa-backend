import { Virement } from "../models/Virement";
import { Compte } from "../models/Compte";
import { Userdb } from "../../oauth2Server/models/User";
import { STATUT_VIR_VALIDE } from "../models/StatutVirement";
const Sequelize = require('cu8-sequelize-oracle');
const xmlParser=require("xml2js-parser")

export class VirementExtController{



    traiterVirement = (fichier:any)=>{

            xmlParser.parseString(fichier,(err,result)=>{
                if(err){
                    console.log("Erreur dans le parsing de virement xml")
                    console.log(err)
                    return 
                }
                console.log(result)
                let virement=this.virementFromExterne(result.virement)
              /*   Virement.create({

                }) */

            })
    }


    private virementFromExterne=(externe:any)=>{
        var criteria = {
            where: Sequelize.where(Sequelize.fn("concat", Sequelize.col("nom"), Sequelize.col("prenom")),externe.destinataire[0].nom[0])} 
        console.log(externe.destinataire[0].compte[0])
            Compte.findOne({
                where:{
                    num_compte:externe.destinataire[0].compte[0],

                }
            }).then((compte:any)=>{
                
                console.log(Sequelize)
                if(!compte){
                    console.log("compte destinataire introuvable")
                    console.log("TEST")
                    return
                }
                console.log(compte)
                // trouver l'utilisateur qui corespondant au nom donne dans le virement 
                Userdb.findOne(criteria)
                    .then(personne=>{
                    /* if(!personne){
                        console.log("cette personne nexiste po ")
                        return
                    } */
                    // ici on vas lancer le virement
                    var now = new Date(externe.date[0].substring(0,4), externe.date[0].substring(4,6)
                        , externe.date[0].substring(6,8),
                        externe.date[0].substring(8,10), externe.date[0].substring(10,12))
 
                    var nouveau ={
                        montant:externe.montant[0]+".00",
                        code_virement:externe.numero[0],
                        motif:externe.motif[0],
                      //  date_virement:now,
                        emmetteur:  externe.titulaire[0].compte[0],
                        recepteur: externe.destinataire[0].compte[0] ,
                        statut_virement:STATUT_VIR_VALIDE
                    }
                  
                    Virement.create({
                        code_virement:"THW000002DZDTHW000002DZD20180204105510",
                       //
                        montant:62,//nouveau.montant,
                        motif:"RZDFfdz",
                      //  date_virement:Date.now,
                        emmetteur:"THW000001DZD",//nouveau.emmetteur,
                        recepteur:"THW000005DZD",//nouveau.recepteur,
                        statut_virement:2//nouveau.statut_virement
                      }).then((created:any)=>{
                        console.log("Creation avec success")
                    })
                    return nouveau
                })
             
                
            })
           //
           

    }

    stringToDate=(_date,_format,_delimiter)=>
    {
      var formatLowerCase=_format.toLowerCase();
      var formatItems=formatLowerCase.split(_delimiter);
      var dateItems=_date.split(_delimiter);
      var monthIndex=formatItems.indexOf("mm");
      var dayIndex=formatItems.indexOf("dd");
      var yearIndex=formatItems.indexOf("yyyy");
      var month=parseInt(dateItems[monthIndex]);
      month-=1;
      var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
      return formatedDate;
    }

     
}