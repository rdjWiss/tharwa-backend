import { TypeCompte } from '../../app/models/TypeCompte';
import { sequelize } from '../../config/db';

const mocks=[
  {
    id_type:1,
    designation:"Courant"  
  },
  {
    id_type:2,
    designation:"Epargne"  
  },
  {
    id_type:3,
    designation:"Devise"  
  },
]

TypeCompte.drop()

TypeCompte.sync({force:true,})
  .then((creation:any)=>{
    mocks.forEach(element => {
      TypeCompte.create(element)
        .then(()=>{
           console.log("added type compte :"+element.id_type)
        });
    
    });
  })
