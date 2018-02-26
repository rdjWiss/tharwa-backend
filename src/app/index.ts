import { Server} from "./server";
import * as fs from 'fs';
import * as https from 'https';


const serveur =new Server();
https.createServer({
    
});
serveur.app.listen(process.env.PORT ||  3000)
