"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = /** @class */ (function () {
    function User(name, password, email) {
        this.email = email;
        this.name = name;
        this.password = password;
    }
    User.prototype.verifyPassword = function (pass) {
        return this.password === pass;
    };
    User.findUser = function (email) {
    };
    return User;
}());
exports.User = User;
