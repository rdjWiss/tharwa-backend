import { Userdb } from '../../oauth2Server/models/User';
import { sequelize } from '../../config/db'
var crypto = require('crypto')


const mocks=[
    {
        id:1,
        nom:"Djamel",
        prenom:"Dahmane",
        photo:"assets/images/image.jpg",
        telephone:"213561922394",
        
        password:crypto.createHash('md5').update('Dahmane').digest('hex'),
        email:"ed_dahmane@esi.dz",
        fonctionId:"C"
    },
    {
        id:2,
        nom:"Test",
        password:crypto.createHash('md5').update('Test').digest('hex'),
        email:"test@esi.dz",
        
        prenom:"Testt",
        photo:"assets/images/image.jpg",
        telephone:"213672478479",
        fonctionId:"G"
    }
    ,{
        id:3,
        nom:"Redjem",
        password:crypto.createHash('md5').update('Test').digest('hex'),
        email:"ew_redjem@esi.dz",
        
        prenom:"Wissem",
        photo:"assets/images/image2.jpg",
        telephone:"213659125992",
        fonctionId:"E"
    }
    ,{
        id:4,
        nom:"Grine",
        password:crypto.createHash('md5').update('Test').digest('hex'),
        email:"ea_grine@esi.dz",
        
        prenom:"Alima",
        photo:"assets/images/image2.jpg",
        telephone:"213659125992",
        fonctionId:"C"
    }
    ,{
        id:5,
        nom:"Boudjelida",
        password:crypto.createHash('md5').update('Test').digest('hex'),
        email:"dm_boudjelida@esi.dz",
        
        prenom:"Mouna",
        photo:"assets/images/image2.jpg",
        telephone:"213659125992",
        fonctionId:"B"
    }
    ,{
        id:6,
        nom:"Mohamadi",
        password:crypto.createHash('md5').update('Test').digest('hex'),
        email:"em_mohamadi@esi.dz",
        
        prenom:"Yassine",
        photo:"assets/images/image.jpg",
        telephone:"213659125992",
        fonctionId:"G"
    }
]

Userdb.drop();

Userdb.sync({
  force:true,
}).then((creation:any)=>{
  mocks.forEach(element => {
    Userdb.create(element)
      .then(()=>{
        console.log("addes user :"+element.email)
      });
  });
})
