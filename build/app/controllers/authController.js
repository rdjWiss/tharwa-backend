"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User_1 = require("../models/User");
function loginController(req, res, next) {
    var mail = req.body.email;
    var pass = req.body.password;
    console.log(req);
    if (!mail || !pass) {
        res.status(400);
        res.json(req.body);
    }
    else {
        var user = User_1.User.findUser(mail);
        if (!user) {
            res.status(400);
            res.send("Nom d'utilisateur ou mot de passe incorrecte ");
        }
        else {
            // L'utilisateur est connecté 
        }
    }
}
exports.loginController = loginController;
function getAuthToken(req, res) {
}
exports.getAuthToken = getAuthToken;
