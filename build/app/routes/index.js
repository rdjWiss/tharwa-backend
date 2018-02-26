"use strict";
/* app/controllers/welcomeController.ts */
Object.defineProperty(exports, "__esModule", { value: true });
// Import only what we need from express
var express_1 = require("express");
var oauth_1 = require("./oauth");
// Assign router to the express.Router() instance
var router = express_1.Router();
// The / here corresponds to the route that the WelcomeController
// is mounted on in the server.ts file.
// In this case it's /welcome
router.get('/', function (req, res) {
    // Reply with a hello world when no name param is provided
    res.send('Hello, Test!');
});
// Les routes de Oauth2
router.use('/authserver', oauth_1.OauthRouter);
// Export the express.Router() instance to be used by server.ts
exports.IndexRoutes = router;
