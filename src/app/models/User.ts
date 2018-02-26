import {sequelize} from '../config/db'
import * as Sequelize from 'sequelize'

import { VerificationToken } from './VerificationToken'

export const Userdb = sequelize.define('userdb', {
   id : {
      primaryKey: true,
      autoIncrement:true,
      allowNull:false,
      type: Sequelize.INTEGER
    },
    ////
    username: Sequelize.STRING,
    ////
    birthday: Sequelize.DATE,
    ////
    email: {
      type: Sequelize.STRING,
      allowNull:false,
      validation:{
       isEmail:true
      }
    },
    ////
    password: {
      type:  Sequelize.STRING,
      allowNull:false,
      min:6,
      max:25,
      notEmpty:true,

    }
  });

/*Userdb.hasMany(VerificationToken)*/
/*Userdb.belongsTo(VerificationToken, { as: 'currentToken', constraints: false })*/


