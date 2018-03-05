import { Userdb } from '../../oauth2Server/models/User';
import { sequelize } from '../../config/db'


const mocks=[{
    nom:"Djamel",
    prenom:"Dahmane",
    photo:"assets/image",
    telephone:"213561922394",

    password:"Dahmane",
    email:"ed_dahmane@esi.dz",
    
    },
    {
    nom:"Test",
    password:"Test",
    email:"test@esi.dz",
    
    prenom:"Testt",
    photo:"assets/image",
    telephone:"213672478479",
    }
    ,{
        nom:"Redjem",
        password:"Test",
        email:"ew_redjem@esi.dz",
        
        prenom:"Wissem",
        photo:"assets/image",
        telephone:"213659125992",
        
    }
    ,{
        nom:"Grine",
        password:"Test",
        email:"ea_grine@esi.dz",
        
        prenom:"Alima",
        photo:"assets/image",
        telephone:"213659125992",
        
    }
]

sequelize.sync({
    force:true,
}).then(creation=>{
    mocks.forEach(element => {
        Userdb.create(element)
        .then(()=>{
           console.log("addes user :"+element.email)
        });
    
    });

    })
