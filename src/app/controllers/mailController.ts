const sendgrid = require('@sendgrid/mail');
import { apiKey} from '../../config/sendgrid'
import { Parametre } from '../models/Parametre';

var timeToResendMail = 10000 //10 sec
export var emailTharwa = ''

export class MailController{

    public static sendMail(to:string,subject:string,texte:string){
      Parametre.findOne({
        where:{
          id_param:4
        }
      }).then((param:any)=>{
        if(param){
          emailTharwa=param.valeur
          // console.log(emailTharwa)
          
          sendgrid.setApiKey(apiKey);
            const msg = {
            to: to,
            from: emailTharwa,
            subject: subject,
            text: texte,
            html: ''+texte+'',
            };
            console.log("Sending mail to ", msg.to);
            MailController.sendMailAsynch(msg);

            return;
        }

      })
    }
    
  private static sendMailAsynch(msg: { to: string; from: string; subject: string; text: string; html: string; }) {
    sendgrid.send(msg).then(() => {
      console.log("Mail sent to ", msg.to);
    }).catch((err:any) => {
      console.log("Error sending mail");//,err);
      setTimeout(function(){
        console.log('Resending mail')
        MailController.sendMailAsynch(msg)
      },timeToResendMail);
      
    });
  }
}
