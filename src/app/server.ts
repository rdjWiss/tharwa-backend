// Les Bibliotheque utilise 
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as passport from 'passport'
import errorHandler = require('errorhandler');
// Les routes 
import { IndexRoutes } from './routes/index'


/**
 *  server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;
  


  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {

    //creer une nouvelle instance de l'application express 
    this.app = express();
    // Allow Cross origin request and response 
    this.app.all('*', function(req, res,next) {
      /**
       * Response settings
       * @type {Object}
       */
      var responseSettings = {
          "AccessControlAllowOrigin": req.headers.origin,
          "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
          "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
          "AccessControlAllowCredentials": true
      };
  
      /**
       * Headers
       */
          res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
          res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
          res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
          res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);
  
      if ('OPTIONS' == req.method) {
          res.send(200);
      }
      else {
          next();
      }
  
  
  });
  
    //configurer application
    this.config();
    console.log(__dirname);

    
   /** https.createServer({
      key: fs.readFileSync(__dirname +'/key.pem'),
      cert: fs.readFileSync(__dirname +'/cert.pem')
    }, this.app).listen(55555);*/
  }

  /**
   * Configurer application
   *
   * @class Server
   * @method config
   */
  public config() {
  

    this.app.use(express.static(path.join(__dirname, 'assets')));

   
    // monter le  logger
  //  this.app.use(logger("dev"));

    // Utiliser bodyparser dans l'app  pour Json 
    this.app.use(bodyParser.json());
    // Implementer les  Routes 
    this.app.use(IndexRoutes)
 // Utiliser bodyparser dans l'app  pour les URL 
     this.app.use(bodyParser.urlencoded({
      extended: true
    }));

  
    // catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        err.status = 404;
        next(err);
    });

    //error handling
    this.app.use(errorHandler());

  }
}
