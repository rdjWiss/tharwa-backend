import  { OrdreVirement } from '../../../app/models/OrdreVirement';
import { Compte } from '../../../app/models/Compte';
import { EtatActuelCompte } from '../../../app/models/Views/EtatActuelCompte';



export class OrdreVirementSeed{

    public static seed(){
        OrdreVirement.sync({force:true})
             .then(()=>{
                    console.log("Creation de la table Ordre de virement ...")
                    // Trouver tous les comptes valides 
                        EtatActuelCompte.findAll({
                        where: {
                            id_statut: 13 
                        },
                        include:[Compte]
                    }).then((resultat:any)=>{
                        resultat.forEach((element:any ) => {
                                console.log(element.dataValues.num_compte)
                                OrdreVirement.create({
                                    statut_ordre:1,
                                    num_compte:element.dataValues.num_compte
                                }).then(()=>{
                                    console.log("Creation de l'ordre de virement ...")
                                
                                })
                        });
                    })
                    
             })
    }
}