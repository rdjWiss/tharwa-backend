import { StatutVirement } from "../../../app/models/StatutVirement";

const Mocks=[
    {
        id_statut_vir: 1,
        designation: 'En cours de traitement'
    },{
        id_statut_vir: 2,
        designation: 'Validé'
    },{
        id_statut_vir: 3,
        designation: 'Rejeté'
    }
]


export class StatutVirementSeed{
  public static seed(){
    StatutVirement.sync({force:true})
      .then(()=>{
        Mocks.forEach((element)=>{
          StatutVirement.create(element)
            .then(()=>{
              console.log("Ajout de statut :",element.designation)
            })
        })
      })
    }
}