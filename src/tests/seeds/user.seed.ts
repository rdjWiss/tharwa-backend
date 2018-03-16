import { Userdb } from '../../oauth2Server/models/User';
import { sequelize } from '../../config/db'
var crypto = require('crypto')


const mocks=[{
    nom:"Djamel",
    prenom:"Dahmane",
    photo:"assets/images/image.jpg",
    telephone:"213561922394",
    
    password:crypto.createHash('md5').update('Dahmane').digest('hex'),
    email:"ed_dahmane@esi.dz",
    fonctionId:"G"
    },
    {
    nom:"Test",
    password:crypto.createHash('md5').update('Test').digest('hex'),
    email:"test@esi.dz",
    
    prenom:"Testt",
    photo:"assets/images/image.jpg",
    telephone:"213672478479",
    fonctionId:"E"
    }
    ,{
        nom:"Redjem",
        password:crypto.createHash('md5').update('Test').digest('hex'),
        email:"ew_redjem@esi.dz",
        
        prenom:"Wissem",
        photo:"assets/images/image.jpg",
        telephone:"213659125992",
        fonctionId:"B"
    }
    ,{
        nom:"Grine",
        password:crypto.createHash('md5').update('Test').digest('hex'),
        email:"ea_grine@esi.dz",
        
        prenom:"Alima",
        photo:"assets/images/image.jpg",
        telephone:"213659125992",
        fonctionId:"C"
    }
]

sequelize.sync({
    //force:true,
}).then((creation:any)=>{
    mocks.forEach(element => {
        Userdb.create(element)
        .then(()=>{
           console.log("addes user :"+element.email)
        });
    
    });

    })
