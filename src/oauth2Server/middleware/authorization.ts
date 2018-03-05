import { Request, Response,RequestHandler, NextFunction } from 'express'

const appKeys = [
    {
        name:"Application Mobile",
        client_id:"152",
        client_secret:"Test"
    },
    {
        name:"Application Web",
        client_id:"541",
        client_secret:"Web"
    },
    {
        name:"Application Backend",
        client_id:"874",
        client_secret:"Backend"
    }
]
const findClient=function(id,secret):boolean{
            return ! appKeys.every(element => {
                   return (element.client_id!==id && element.client_secret!==secret)

            });

}
export const authMiddleware:RequestHandler = function(req,res,next){

    console.log(req.headers);
    console.log(req.body);
    let client_id = req.headers.client_id
    let client_secret = req.headers.client_secret

    if( !client_id || !client_secret ){
        res.status(401)
        res.send({
            error:"invalid_request",
            error_description:"verifier les champs client_id et client_secret"
        })
    }else{
        if(!findClient(client_id,client_secret)){
            res.status(401)
            res.send({
                error:"unauthorized_client",
                error_description:"L'application n'est pas authorisé"
                })
        } else {
            // Traitement normal 
            console.log(client_id);
                    next()
            }
        }
        
    }

