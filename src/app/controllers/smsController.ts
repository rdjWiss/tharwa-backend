import { nexmo } from "../../config/nexmo";
import { logger } from "../../config/logger";
export class SmsController{

  public static sendSms(from:string,to:number,text:string){

      return nexmo.message.sendSms(from, to, text, (error:any, response:any) => {
          if(error) {
            //throw error;
            logger.taglog('error',"Erreur Envoi SMS",error,['SMS'])
            console.log("SMS not sent")
          } else if(response.messages[0].status != '0') {
            logger.taglog('error',"Erreur Envoi SMS",error,['SMS'])
            throw 'Nexmo returned back a non-zero status';
            
          } else {

            logger.taglog('info',"Envoi SMS ",{destinataire:to})
            
          }
        });
  }
}