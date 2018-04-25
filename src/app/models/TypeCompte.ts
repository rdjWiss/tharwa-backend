import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
/*
create table TypeCompte(
id_type_compte numeric(2) primary key,
designation varchar (128)unique not null
);
*/
//Si on ajoute un autre type, il faut ajouter du traitement, so ..
export const COMPTE_COURANT = 1
export const COMPTE_EPARGNE = 2
export const COMPTE_DEVISE = 3
export var typeComptes = [1,2,3]

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


/*
1: Courant
2: Epargne
3: Devise
*/