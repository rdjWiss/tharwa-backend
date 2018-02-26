import { nexmo } from "../config/nexmo";

export class SmsController{




    public static sendSms(from:string,to:number,text:string){

        nexmo.message.sendSms(from, to, text, (error:any, response:Response) => {
            if(error) {
              throw error;
            } else if(response.messages[0].status != '0') {
              console.error(response);
              throw 'Nexmo returned back a non-zero status';
            } else {
              console.log(response);
            }
          });
    }


}