import { AvoirStatut } from '../../app/models/AvoirStatut';
import { sequelize } from '../../config/db'


const mocks=[
    {
      num_compte: "THW000001DZD",
      id_statut: 1,
      date_statut: sequelize.NOW
    },
    
]

AvoirStatut.sync(/* {force:true,} */)
  .then((creation:any)=>{
    mocks.forEach(element => {
      AvoirStatut.create(element)
      .then(()=>{
          console.log("Ajout avoir status :"+element.num_compte)
      });
    });
  })
