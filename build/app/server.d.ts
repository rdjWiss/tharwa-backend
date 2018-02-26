/// <reference types="express" />
import * as express from 'express';
/**
 *  server.
 *
 * @class Server
 */
export declare class Server {
    app: express.Application;
    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    static bootstrap(): Server;
    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor();
    /**
     * Configurer application
     *
     * @class Server
     * @method config
     */
    config(): void;
}
