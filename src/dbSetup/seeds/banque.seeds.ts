
import { sequelize } from '../../config/db'
import { Banque } from '../../app/models/Banque';

const mocks=[
  {
    code_banque: 'THW',
    nom: 'Tharwa',
    raison_sociale:'THW',
    adresse:'Oued Smar',
    email:'thw@gmail.com'
  },
  {
    code_banque: 'BNA',
    nom: 'Banque nationale d\'Algérie',
    raison_sociale:'BNA',
    adresse:'08, Bd Ernesto Che Guevara - Alger',
    email:'bna@gmail.com'
  },
  {
    code_banque: 'BEA',
    nom: 'Banque Extérieure d’Algérie',
    raison_sociale:'BEA',
    adresse:' 11 Boulevard Colonel Amirouche - Alger BP',
    email:'bea@gmail.com'
  },
]

Banque.sync({force:true,})
  .then((creation:any)=>{
    mocks.forEach(element => {
      Banque.create(element)
      .then(()=>{
          console.log("Ajout banque :"+element.code_banque)
            
      });
      console.log("Table banque crée avec succés ")
    });
})