import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
/*
create table StatutCompte (
id_statut numeric(3) primary key, 
designation varchar(128) not null unique);

);
*/

export const StatutCompte = sequelize.define('StatutCompte', {
    id_statut:{
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement:true,
    },
    designation:{
      allowNull:false,
      type: Sequelize.STRING,
      //unique:true
    }
  },{}
);

/*
1: A valider
2: Actif (débloqué)
3: Bloqué
4: Rejeté
*/