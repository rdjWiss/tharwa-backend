import { Parametre } from '../../app/models/Parametre';
import { sequelize } from '../../config/db'


const mocks=[
    {
      designation: "Numero Sequentiel (du numero du compte bancaire)",
      valeur: "000002"
    },
    {
      designation: "Montant seuil de validation",
      valeur: "200000",
      unite:"DZD"
    },
    {
      designation: "Verification token timeout",
      valeur: "60",
      unite:"min"
    },
    
]

Parametre.sync(/* {force:true,} */)
  .then((creation:any)=>{
    mocks.forEach(element => {
      Parametre.create(element)
      .then(()=>{
          console.log("Ajout du parametre"+element.designation+' : '+element.valeur)
      });
    });
  })
