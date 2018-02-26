"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User_1 = require("../models/User");
exports.tabUser = [
    new User_1.User('djamel', 'dahmane', 'ed_dahmane@esi.dz'),
    new User_1.User('test1', 'test1', 'test1@gmail.com'),
    new User_1.User('test2', 'test2', 'test2@gmail.com'),
    new User_1.User('test3', 'test3', 'test3@gmail.com'),
    new User_1.User('test4', 'test4', 'test4@gmail.com'),
    new User_1.User('test5', 'test5', 'test5@gmail.com'),
    new User_1.User('test6', 'test6', 'test6@gmail.com'),
    new User_1.User('test7', 'test7', 'test7@gmail.com'),
    new User_1.User('test8', 'test8', 'test8@gmail.com'),
];
function findOne(email) {
    exports.tabUser.forEach(function (element) {
        if (element.email === email)
            return element;
    });
    return null;
}
exports.findOne = findOne;
