import { redis } from "../../config/redis";
import { logger } from "../../config/logger";
import {} from 'typescript-ioc'
import * as Express from 'express'
export var socket = require('socket.io')
import {Notification} from '../../app/models/Notification'
var backup:any


export class NotificationController{
  private static instance:NotificationController

  public static  getSockets=()=>{
    if( NotificationController.instance==null) {
      console.log("premier instanciations")
      NotificationController.instance=new NotificationController()
    }
    return NotificationController.instance
  }
  private static connected=socket()
  public static getConnected=()=> NotificationController.connected
  
  public initialiserNotificationSocket = function(server:any){
    const notif = socket(server)
    NotificationController.connected=notif
    console.log("lancement de serveur de notification")
    notif.on("chat message",function(client:any){
     console.log("Test Message chat")
    })
    notif.on('connection',function(client:any){
      console.log('test ')
      // console.log(client)
      client.emit('ack','Bienvenue a nous !!')
      // console.log(client)
      // console.log(notif.sockets)
      client.emit('inscription','Bienvenue a nous !!')
      client.on("inscription",function(test:any){
        console.log("inscription de l'utilisateur "+test.email)
        console.log(test.email)
        redis.set(test.email,test.socketId)
        logger.taglog("debug","Reception d'un web socket",test,["Connexion SocketIo"])
        
        // notif.to(test.socketId).emit("notif", '"hello');
      
      })


    })
    notif.on('ack',function(msg:any){
      console.log('ack',msg)

    })    
  }

  public notifierUser=(socketId:any,message:any)=>{
        console.log(NotificationController.connected)
        // NotificationController.connected.to(socketId).emit("notif", '"hello');
    }
  
  public notifierUserByMail=(mail:string)=>{
      console.log("Test")
      redis.get("ed_dahmane@esi.dz",(err,reply)=>{
        console.log(reply)
        this.notifierUser(reply,"Salam alikoum")

      })
      return true
  }

}
