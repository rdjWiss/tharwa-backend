import { MailController } from '../app/controllers/mailController'

MailController.sendMail('test','ed_dahmane@esi.dz',"Test de fonctionnement","Alo")
              .then(response=>{
                console.log("Message envoyé")
              })