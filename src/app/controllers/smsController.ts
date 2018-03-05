import { nexmo } from "../../config/nexmo";
export class SmsController{

  public static sendSms(from:string,to:number,text:string){

      return nexmo.message.sendSms(from, to, text, (error:any, response:any) => {
          if(error) {
            throw error;
          } else if(response.messages[0].status != '0') {
            console.log("OK msg");
            console.error(response);
            throw 'Nexmo returned back a non-zero status';
          } else {
            console.log(response);
            console.log("Not OK msg");
            
          }
        });
  }
}