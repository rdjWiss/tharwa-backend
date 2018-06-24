import * as Express from 'express'
import { logger } from '../../config/logger';

const https = require('https');
const API_PATH='https://globalcurrencies.xignite.com/xGlobalCurrencies.json/';
const API_TOKEN='116F4A01160E4AFFAA20D074336DFF76';

let DZD = "DZD"
let EUR = "EUR"
let USD = "USD"

export class Conversion{

  public convertir:Express.RequestHandler=(req:Express.Request,res:Express.Response)=>{  
    let source=req.body.source
    // let   dest=req.body.destination
    let montant=req.body.montant

    if(!source || !montant ){
      res.status(400)
      res.send({
          error: "No source or montant"
      })

    }else{
      let destinations = this.getDestination(source)
      console.log(destinations)
      let converted : any= []
      destinations.forEach((dest:string) => {

        this.convertirMontant(montant, source, dest,
          (reponse: any) => {
            console.log("Conversion to ",dest)
            // res.status(200)
            // res.json(reponse)
            let size = converted.push({
              dest: dest,
              montant: reponse.Result,
              taux: reponse.Rate
            })
            // console.log(reponse)
            if(size == destinations.length){
              console.log(converted)
              res.status(200)
              res.send({
                conversion: converted
              })
            }
        },
        (error: any) => {
            res.status(500)
            res.send({
                error: error
            })
  
        })
        
      });

      /* this.convertirMontant(montant, source, dest,
        (reponse: any) => {
          console.log("Conversion termine ")
          res.status(200)
          res.json(reponse)
      },
      (error: any) => {
          res.status(500)
          res.send({
              error: error
          })

      }) */
    }
        
  }

  private getDestination(source : string): string[]{
    if (source == DZD) return [EUR,USD]
    else if(source == EUR) return [DZD,USD]
    else if(source == USD) return [DZD,EUR]
    else return []
  }

  private RequeteGet(url: string, callback: Function, error: ErrorEventHandler) {
    https.get(url, (resp: any) => {
      let data = '';
      // Reception des données en cours
      resp.on('data', (chunk: any) => {
        data += chunk;
      });
      // La requete est termine afficher le resultat
      resp.on('end', () => {
        // console.log(JSON.parse(data));
        callback(JSON.parse(data));
      });
    }).on("error", (err: any) => {
        error(err);
    });
  }

  public  convertirMontant(montant:number,codeMonnaieSrc:string,codeMonnaieDest:string,callback:Function,errorHandler:ErrorEventHandler){
    console.log("Conversion de monnaie")
    let url =   API_PATH+'ConvertRealTimeValue?From='+
                codeMonnaieSrc+'&To='+
                codeMonnaieDest+'&Amount='+montant
                +'&_token='+API_TOKEN;

    this.RequeteGet(url,callback,errorHandler)
  }
}