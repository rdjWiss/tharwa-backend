import { LigneOrdre } from '../../../app/models/LigneOrdre'
import { OrdreVirement } from '../../../app/models/OrdreVirement';



export class LigneOrdreSeed{

    public static seed(){
        LigneOrdre.sync({force:true})
          .then(()=>{
              console.log("Creation de la table Ligne Ordre ")
              OrdreVirement.scope('enAttente')
                           .findAll()
                           .then((resultat:any)=>{
                               resultat.forEach((element:any) => {
                                     LigneOrdre.create({
                                         num_compte:'THW000002DZD',
                                         id_ordre:element.dataValues.id_ordre,
                                         montant: 5000.55
                                     })
                               });
                           })
          })       
    }
}