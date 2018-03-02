import { Userdb } from "../models/User";

const Sequelize = require('cu8-sequelize-oracle');
import { VerificationToken } from '../models/VerificationToken'
console.log("1");
export const sequelize = new Sequelize('xe', 'hr', 'password', {
    database: 'hr',
    username: 'hr',
    password: 'password',
    logging: false,
    host: '127.0.0.1',
    dialect: 'oracle',
    port: 1521,
  
  pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
   // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
  });







sequelize
.authenticate()
.then(() => {
console.log('Connection has been established successfully.');

})
.catch(err => {
console.error('Unable to connect to the database:', err);
});

