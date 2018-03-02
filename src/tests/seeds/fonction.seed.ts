import { Fonction } from '../../app/models/Fonction';
import { sequelize } from '../../app/config/db'


const mocks=[{
        designation:"Gestionnaire",
    },{
        designation:"Banquier",
    },{
        designation:"Client",
    },{
        designation:"Employeur",
    }
]

sequelize.sync({
    force:true,
}).then(creation=>{
    mocks.forEach(element => {
        Fonction.create(element)
        .then(()=>{
           console.log("addes fonction :"+element.designation)
        });
    
    });

    })
