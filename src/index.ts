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



console.log("Lancement de serveur d'authentification ")
// Lancement de serveur Https d'authentification sur le port 4000
const optionsAuth = {
    key: fs.readFileSync("/Projet/Backend/assets/Tharwa.key"),
    cert: fs.readFileSync("/Projet/Backend/assets/Tharwa.pem")
  };
https.createServer(optionsAuth,authServer.app).listen(4000)


console.log("Lancement de serveur de Tharwa  ")
// Lancement de serveur Https de l'application sur le port 3000
const optionsApp = {
    key: fs.readFileSync("/Projet/Backend/assets/Tharwa.key"),
    cert: fs.readFileSync("/Projet/Backend/assets/Tharwa.pem")
  };
https.createServer(optionsApp,authServer.app).listen(3000)

