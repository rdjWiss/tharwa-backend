import { Server} from '../app/server'
import * as fs from 'fs';
import * as https from 'https';
import * as express from 'express'
import {OauthRouter} from './routes/oauth'

//Créer un nouveau serveur, d'authentiification
export const serveur =new Server();

// 
serveur.app.use('/assets',express.static('./assets'))
//console.log("Dossier images "+express.static('./images'))
//Utiliser les routes définie dans OuathRouter
serveur.app.use(OauthRouter)
export const authServer:any = serveur;





