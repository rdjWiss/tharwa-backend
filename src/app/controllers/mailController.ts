const sendgrid = require('@sendgrid/mail');
import { apiKey} from '../../config/sendgrid'

var timeToResendMail = 10000

export class MailController{

    public static sendMail(from:string,to:string,subject:string,texte:string){
        sendgrid.setApiKey(apiKey);
            const msg = {
            to: to,
            from: from,
            subject: subject,
            text: texte,
            html: ''+texte+'',
            };
            console.log("Sending mail to ", msg.to);
            MailController.sendMailAsynch(msg);

            return;
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
