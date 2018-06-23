import { redis } from "../../config/redis";
import { logger } from "../../config/logger";

export var socket = require('socket.io')
var backup

export class NotificationController{
  public initialiserNotificationSocket = function(server:any){
    const notif = socket(server)
    backup=notif
    
    notif.on('connection',function(client:any){
      console.log('test ')
      // console.log(client)
      client.emit('ack','Bienvenue a nous !!')

      client.emit('inscription','Bienvenue a nous !!')
      client.on("inscription",function(test:any){
        console.log("inscription de l'utilisateur "+test.email)
        console.log(test.email)
        redis.set(test.email,test.socketId)
        logger.taglog("debug","Reception d'un web socket",test,["Connexion SocketIo"])
        })
    })
    notif.on('ack',function(msg:any){
      console.log('ack',msg)
    })

 

    
  }

  /* public notifierUser=function(socketId,message){
     console.log(backup.sockets.connected))

    } */
  

}