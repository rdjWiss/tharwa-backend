import { Server} from '../app/server'
import * as fs from 'fs';
import * as https from 'https';

import {OauthRouter} from './routes/oauth'

export const serveur =new Server();
serveur.app.use(OauthRouter)

export const authServer:any = serveur;





