import * as Redis from 'redis'
import { logger } from './logger';


const client=Redis.createClient();

client.on("error",function(err:any){
    logger.taglog("error",{
        message:"Erreur dans le service redis  ",
        error:err
    },"Redis")
})



export const redis=client
