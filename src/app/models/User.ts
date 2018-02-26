import {sequelize} from '../config/db'
import * as Sequelize from 'sequelize'
export const Userdb = sequelize.define('userdb', {
    username: Sequelize.STRING,
    birthday: Sequelize.DATE,
    email: Sequelize.STRING,
    password: Sequelize.STRING
  });


