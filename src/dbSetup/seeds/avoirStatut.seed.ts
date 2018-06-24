import { AvoirStatut } from '../../app/models/AvoirStatut';
import { sequelize } from '../../config/db'
import {Compte } from  '../../app/models/Compte';
import { StatutCompte} from  '../../app/models/StatutCompte';

AvoirStatut.sync({force:true}).then(()=>{
  console.log('Avoir Statut créée') 

    AvoirStatut.createView().then(()=>{
        console.log("Création de la vue ....")
        
    })
})
