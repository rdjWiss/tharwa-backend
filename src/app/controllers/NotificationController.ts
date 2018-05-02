export var socket = require('socket.io')

export class NotificationController{
  public initialiserNotificationSocket = function(server:any){
    const notif = socket(server)

    notif.on('connection',function(client:any){
      console.log('test ')
      // console.log(client)
      client.broadcast.emit('virement','fkjqljdqlk')
    })
    notif.on('ack',function(msg:any){
      console.log('ack',msg)
    })
  }

  

}