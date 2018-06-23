/*
    @Le point d'entrée de l'application 
    permet de lancer le serveur d'authentification
        et l'application de backend 
        
*/
import { Server} from "./app/server";
import * as fs from 'fs';
import * as https from 'https';
import { authServer } from './oauth2Server/index'
import { appServer } from './app/index'
import {socket, NotificationController} from './app/controllers/NotificationController'
import {logger } from "./config/logger"
var http=require('http')
var notif = new NotificationController()
console.log("Lancement de serveur d'authentification ")
logger.info("Lancement de serveur d'authentification en cours ")
//Lancement du serveur Http d'authentification sur le port 4000
authServer.app.listen(process.env.PORT ||  4000)
// authServer.app.listen(process.env.PORT ||  1000)

console.log("Lancement de serveur de Tharwa  ")
//Lancement du serveur Http de l'app sur le port 4000

var httpServer= http.createServer(appServer.app)
httpServer.listen(process.env.PORT ||  3000)
notif.initialiserNotificationSocket(httpServer)
/* const notif = socket(httpServer)

notif.on('connection',function(client:any){
  console.log('test ')
  // console.log(client)
  client.broadcast.emit('virement','fkjqljdqlk')
})
notif.on('ack',function(msg:any){
  console.log('ack',msg)
}) */
//appServer.app.listen(process.env.PORT ||  3000)
// appServer.app.listen(process.env.PORT ||  2000)


//-----------------------------------------------------------------//
/*
// Lancement de serveur Https d'authentification sur le port 4000
const optionsAuth = {
    key: fs.readFileSync("./assets/Tharwa.key"),
    cert: fs.readFileSync("./assets/Tharwa.pem")
  };
https.createServer(optionsAuth,authServer.app).listen(4000)

// Lancement de serveur Https de l'application sur le port 3000
const optionsApp = {
    key: fs.readFileSync("./assets/Tharwa.key"),
    cert: fs.readFileSync("./assets/Tharwa.pem")
  };
https.createServer(optionsApp,authServer.app).listen(3000)
//*/