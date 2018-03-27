import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
/*
create table Parametres(
id_param number(2) primary key,
designation varchar(128) unique not null,
valeur number(10) not null
);
*/

export const Parametre = sequelize.define('Parametre', {
  id_param:{
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  designation:{
    allowNull:false,
    type: Sequelize.STRING,
    //unique:true
  },
  valeur:{
    type: Sequelize.STRING,
    allowNull:false,
  },
  unite:{
    type: Sequelize.STRING,
    allowNull:true,
  }
},{}
);