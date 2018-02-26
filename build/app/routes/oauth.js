"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authController_1 = require("../controllers/authController");
var router = express_1.Router();
// Login Controller permet de s'authentifier 
router.post('/login', authController_1.loginController);
router.post('/access', function (req, res) {
    res.json(req.body);
});
// Export the express.Router() instance to be used by server.ts
exports.OauthRouter = router;
