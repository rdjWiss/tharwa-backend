import {sequelize} from '../../config/db'
import {Userdb} from './User'
const Sequelize = require('cu8-sequelize-oracle');

export const Fonction = sequelize.define('fonction', {
  id : {
    primaryKey: true,
    allowNull:false,
    type: Sequelize.STRING
  },
   
  designation: {
    type:  Sequelize.STRING,
    allowNull:false,
    min:6,
    max:25,
    notEmpty:true,
  }
});
Fonction.hasOne(Userdb)

