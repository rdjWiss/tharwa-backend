

var sendgrid = require("sendgrid")("SENDGRID_APIKEY");
export class MailController{

    public static sendMail(from:string,to:string,subject:string,texte:string){
        var email = new sendgrid.Email();
        
        email.addTo(to);
        email.setFrom(from);
        email.setSubject(subject);
        email.setHtml(texte);
    
        sendgrid.send(email);
    
    }
}
