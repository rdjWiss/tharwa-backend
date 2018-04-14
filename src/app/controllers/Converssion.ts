
import * as Express from 'express'

const https = require('https');
const API_PATH='https://globalcurrencies.xignite.com/xGlobalCurrencies.json/';
const API_TOKEN='6F09B3E194F941E58210075FF14A46EC';

/**
 *  Class Converssion 
 *  Utilisation 
 *  let conversion=new Converssion()
 *  
 */

export class Converssion{


    public getTauxdeChange:Express.RequestHandler=function(req:Express.Request,res:Express.Response){
            this.recupererTauxdeChange(
                (response:any)=>{
                        res.status(200)
                        res.json(response)
                  },

                (error:any)=>{
                        res.status(500)
                        res.json({
                            error:error
                        })
                }
            )
    }

    public recupererTauxdeChange(callback:Function,error:ErrorEventHandler){
        let url =API_PATH + "GetRealTimeRateTable?Symbols=DZD,EUR,USD,AUD,JPY&PriceType=Mid"
        + "&_token="+API_TOKEN
                  this.RequeteGet(url, callback, error);
        }
    
    public convertir:Express.RequestHandler=function(req:Express.Request,res:Express.Response){
        
        let source=req.body.source
        let   dest=req.body.destination
        let montant=req.body.montant

        this.convertirMontant(montant, source, dest,
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

                    }    
    )    
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
                console.log(JSON.parse(data));
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
