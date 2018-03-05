import {sequelize} from '../../config/db'
//import * as Sequelize from 'sequelize'
const Sequelize = require('cu8-sequelize-oracle');
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