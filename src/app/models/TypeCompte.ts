import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
/*
create table TypeCompte(
id_type_compte numeric(2) primary key,
designation varchar (128)unique not null
);
*/

export const TypeCompte = sequelize.define('typecompte', {
    id_type:{
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

//TODO: récupérer types comptes de la bdd
export var typeComptes = [1,2,3]
/*
1: Courant
2: Epargne
3: Devise
*/