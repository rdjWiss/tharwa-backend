import { Server} from '../app/server'
import * as fs from 'fs';
import * as https from 'https';

import {OauthRouter} from './oauth'

export const serveur =new Server();
serveur.app.use(OauthRouter)

export const test:any = serveur.app.listen(process.env.PORT ||  4000)




// Lancer le serveur d'authentification Oauth sur le port 
