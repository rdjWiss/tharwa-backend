import { Userdb } from '../../app/models/User';
import { sequelize } from '../../app/config/db'


const mocks=[{
    nom:"Djamel",
    prenom:"Dahmane",
    photo:"htp://localhost:3000/assets/image",
    telephone:"213561922394",

    password:"Dahmane",
    email:"ed_dahmane@esi.dz",
    birthday:new Date(15,25,2010)
    },
    {
    nom:"Test",
    password:"Test",
    email:"bidon@esi.dz",
    birthday:new Date(4,5,2010),
    prenom:"Testt",
    photo:"htp://localhost:3000/assets/image",
    telephone:"213672478479",
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
