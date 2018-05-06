import { StatutCompte } from '../../app/models/StatutCompte';
import { sequelize } from '../../config/db'


const mocks=[
    {
      id_statut: 1,
      designation: "A valider"
    },
    {
      id_statut: 2,
      designation: "Actif"
    },
    {
      id_statut: 3,
      designation: "Bloqué"
    },
    {
      id_statut: 4,
      designation: "Rejeté"
    },
]

StatutCompte.sync({force:true,})
  .then((creation:any)=>{
    mocks.forEach(element => {
      StatutCompte.create(element)
      .then(()=>{
          console.log("Ajout statut compte :"+element.id_statut)
      });
    });
  })
