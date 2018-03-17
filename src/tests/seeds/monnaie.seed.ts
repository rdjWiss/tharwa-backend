import { Monnaie } from '../../app/models/Monnaie';
import { sequelize } from '../../config/db';

const mocks=[
  {
    code_monnaie:"DZD",
    nom_monnaie:"Dinar Algérien"  
  },
  {
    code_monnaie:"EUR",
    nom_monnaie:"Euro"  
  },
  {
    code_monnaie:"USD",
    nom_monnaie:"Dollar Américain"  
  }
]

sequelize.sync({
    force:true,
}).then((creation:any)=>{
    mocks.forEach(element => {
        Monnaie.create(element)
        .then(()=>{
           console.log("added monnaie :"+element.code_monnaie)
        });
    
    });

    })
