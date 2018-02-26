import { Userdb } from '../../models/User';
import { sequelize } from '../../config/db'


const mocks=[{
    username:"Djamel",
    password:"Dahmane",
    email:"ed_dahmane@esi.dz",
    birthday:new Date(15,25,2010)
    },
    {
    username:"Test",
    password:"Test",
    email:"bidon@esi.dz",
    birthday:new Date(4,5,2010)
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
