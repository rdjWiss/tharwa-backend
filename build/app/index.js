"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
var serveur = new server_1.Server();
serveur.app.listen(process.env.PORT || 3000);
