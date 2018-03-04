

const sendgrid = require('@sendgrid/mail');
import { apiKey} from '../../config/sendgrid'
export class MailController{

    public static sendMail(from:string,to:string,subject:string,texte:string){
        sendgrid.setApiKey(apiKey);
            const msg = {
            to: to,
            from: from,
            subject: subject,
            text: texte,
            html: `<strong>Validate your connection </strong>
                `+texte+`
            `,
            };
            console.log("Sending mail")
            console.log(msg)
            return sendgrid.send(msg);
    }
}
