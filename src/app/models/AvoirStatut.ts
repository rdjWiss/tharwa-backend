import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import {StatutCompte} from './StatutCompte'
/*
create table AvoirStatut (
num_compte varchar(12),
id_status numeric(3), 
statut_date date,
motif varchar(128), 
primary key (num_compte,id_status,statut_date)
);
*/

//PB avec les coupound primary key. A deéfinir manuellement avec Oracle DSL Developer

export const AvoirStatut = sequelize.define('AvoirStatut', {
    date_statut:{
      primaryKey: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    motif:{
      allowNull:true,
      type: Sequelize.STRING,
      //unique:true
    }
  },{}
);
AvoirStatut.belongsTo(Compte,{foreignKey: 'num_compte' } );
AvoirStatut.belongsTo(StatutCompte, {foreignKey: 'id_statut', unique:false});