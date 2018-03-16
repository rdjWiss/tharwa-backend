import { Fonction } from '../../oauth2Server/models/Fonction';
import { sequelize } from '../../config/db'


const mocks=[{
        id:"G",    
        designation:"Gestionnaire"
    },{
        id:"B",  
        designation:"Banquier"
    },{
        id:"C",  
        designation:"Client"
    },{
        id:"E",  
        designation:"Employeur"
    }
]

sequelize.sync({
    force:true,
}).then((creation:any)=>{
    mocks.forEach(element => {
       
        Fonction.create(element)
        .then(function(savedPerson:any) {
           console.log(savedPerson.id)
           console.log("addes fonction :"+element.designation)
        });
    
    });

    })
