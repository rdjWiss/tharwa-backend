import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import { Userdb } from './User';

export const PasswordResetToken = sequelize.define('passwordResetToken', {
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

PasswordResetToken.belongsTo(Userdb);