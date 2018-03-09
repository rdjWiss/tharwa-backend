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
        //type:Sequelize.BOOLEAN,
        type:Sequelize.INTEGER, //-1 non utilisé, 1 utilisé et 
                                //0 nbr d'attempts atteint sans utilisation ou expired
        allowNull: true,
        default: -1
    },
    
    id : {
        type: Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement: true,
    },
    attempts:{
        type: Sequelize.INTEGER,
        default: 0
    },

    expire:{
        type: Sequelize.INTEGER,
        allowNull:false
    }
    
  });

VerificationToken.belongsTo(Userdb);