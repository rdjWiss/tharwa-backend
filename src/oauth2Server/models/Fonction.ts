import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');

export const Fonction = sequelize.define('fonction', {
  id : {
    primaryKey: true,
    autoIncrement:true,
    allowNull:false,
    type: Sequelize.INTEGER
  },
   
  designation: {
    type:  Sequelize.STRING,
    allowNull:false,
    min:6,
    max:25,
    notEmpty:true,
  },
});
