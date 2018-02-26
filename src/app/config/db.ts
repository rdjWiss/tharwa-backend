import { Userdb } from "../models/User";

const Sequelize = require('sequelize');
import { VerificationToken } from '../models/VerificationToken'
export const sequelize = new Sequelize('projet', 'projet', 'projet', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  

 // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});
