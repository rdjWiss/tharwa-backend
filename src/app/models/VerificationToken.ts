import {sequelize} from '../config/db'
import * as Sequelize from 'sequelize'
import { Userdb } from './User';
export const VerificationToken = sequelize.define('verificationtoken', {
     token: {
        type:Sequelize.INTEGER,
        allowNull:false,
        
    },
    used: {
        type:Sequelize.BOOLEAN,
        default: true,
    },
    id : {
        type: Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement: true,

    },
  });


VerificationToken.belongsTo(Userdb);