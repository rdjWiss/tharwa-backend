import { Compte } from '../../app/models/Compte';
import { sequelize } from '../../config/db'

const mocks=[
    {
    num_compte: "THW000001DZD",
    balance: 12300.23,
    id_user:6,
    type_compte:1,
    code_monnaie:"DZD"
    }
]

Compte.sync({force:true,})
  .then((creation:any)=>{
    mocks.forEach(element => {
      Compte.create(element)
      .then(()=>{
          console.log("Ajout compte :"+element.num_compte)
      });
    });
  })
