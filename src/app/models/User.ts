import {sequelize} from '../config/db'
import * as Sequelize from 'sequelize'

import { VerificationToken } from './VerificationToken'
import { Fonction } from './Fonction'

export const Userdb = sequelize.define('userdb', {
   id : {
      primaryKey: true,
      autoIncrement:true,
      allowNull:false,
      type: Sequelize.INTEGER
    },
    ////
    nom: {
      type:  Sequelize.STRING,
      allowNull:false,
      min:6,
      max:25,
      notEmpty:true,

    },
    adresse:{
      type:Sequelize.TEXT,
    },
    prenom: {
      type:  Sequelize.STRING,
      allowNull:false,
      min:6,
      max:25,
      notEmpty:true,

    },
    telephone:{
      type:Sequelize.STRING,
      allowNull: false,
      validation:{
        is:`\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|
          2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|
          4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$`,
        
      }

    },
    photo:{
      type:Sequelize.STRING,
      validation:{
        isUrl:true,
      }
    },
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
Userdb.hasOne(Fonction)
/*Userdb.hasMany(VerificationToken)*/
/*Userdb.belongsTo(VerificationToken, { as: 'currentToken', constraints: false })*/


