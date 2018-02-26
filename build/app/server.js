"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Les Bibliotheque utilise 
var bodyParser = require("body-parser");
var express = require("express");
var logger = require("morgan");
var path = require("path");
var errorHandler = require("errorhandler");
// Les routes 
var index_1 = require("./routes/index");
/**
 *  server.
 *
 * @class Server
 */
var Server = /** @class */ (function () {
    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    function Server() {
        //creer une nouvelle instance de l'application express 
        this.app = express();
        //configurer application
        this.config();
        console.log(__dirname);
        /** https.createServer({
           key: fs.readFileSync(__dirname +'/key.pem'),
           cert: fs.readFileSync(__dirname +'/cert.pem')
         }, this.app).listen(55555);*/
    }
    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    Server.bootstrap = function () {
        return new Server();
    };
    /**
     * Configurer application
     *
     * @class Server
     * @method config
     */
    Server.prototype.config = function () {
        this.app.use(express.static(path.join(__dirname, 'assets')));
        // monter le  logger
        this.app.use(logger("dev"));
        // Utiliser bodyparser dans l'app  pour Json 
        this.app.use(bodyParser.json());
        // Implementer les  Routes 
        this.app.use(index_1.IndexRoutes);
        // Utiliser bodyparser dans l'app  pour les URL 
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        // catch 404 and forward to error handler
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        //error handling
        this.app.use(errorHandler());
    };
    return Server;
}());
exports.Server = Server;
