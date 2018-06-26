import { Parametre } from '../../app/models/Parametre';
import { sequelize } from '../../config/db'

//TODO: changer id_param par code_param plus significatif
const mocks=[
    {
      id_param:2,
      designation: "Numero Sequentiel (du numero du compte bancaire)",
      valeur: "000002"
    },
    {
      id_param:1,
      designation: "Montant seuil de validation",
      valeur: "200000",
      unite:"DZD"
    },
    {
      id_param:3,
      designation: "Verification token timeout",
      valeur: "60",
      unite:"min"
    },
    {
      id_param:4,
      designation: "Email de Tharwa",
      valeur: "no-reply@tharwa.dz"
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
