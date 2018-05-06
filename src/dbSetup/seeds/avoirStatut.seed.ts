import { AvoirStatut } from '../../app/models/AvoirStatut';
import { sequelize } from '../../config/db'
import {Compte } from  '../../app/models/Compte';
import { StatutCompte} from  '../../app/models/StatutCompte';
const mocks=[
    {
      num_compte: "THW000003DZD",
      id_statut: 1,
    },{
      num_compte: "THW000002DZD",
      id_statut: 1,
    },
    {
      num_compte: "THW000002DZD",
      id_statut: 2,
    },
    {
      num_compte: "THW000003DZD",
      id_statut: 4,
    },{
      num_compte: "THW000002DZD",
      id_statut: 3,
    }
    
]

AvoirStatut.sync({force:true}).then(()=>{
   mocks.forEach(element => {
      AvoirStatut.create(element)
      .then(()=>{
          console.log("Ajout compte ")
            
      });
      console.log("Table AvoirStatut crée avec succés ")
    });

    AvoirStatut.createView().then(()=>{
        console.log("Création de la vue ....")
        
    })
})
