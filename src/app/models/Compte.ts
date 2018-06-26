import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {TypeCompte} from './TypeCompte';
import {Monnaie} from './Monnaie';
import {Userdb} from '../../oauth2Server/models/User'
import { AvoirStatut } from './AvoirStatut';
import { StatutCompte } from './StatutCompte';

export const regexpNumCompte = /^[A-Z]{3}\d{6}[A-Z]{3}$/

export const Compte = sequelize.define('Compte', {
    num_compte :{
      primaryKey: true,
      type: Sequelize.STRING,
      validate:{
        is:regexpNumCompte
      }
    },
    balance:{
      allowNull:false,
      type: Sequelize.FLOAT,
    },
    date_creation:{
      allowNull:false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    statut_actuel:{
      allowNull :false,
      type: Sequelize.INTEGER,
      defaultValue: 1,
    }
  },{
    scopes :{
    }
  }
);
Compte.belongsTo(TypeCompte, {foreignKey: 'type_compte'});
Compte.belongsTo(Monnaie, {foreignKey: 'code_monnaie'});
Compte.belongsTo(Userdb, {foreignKey: 'id_user', unique:false});

//Compte.hasMany(StatutCompte, {through: 'AvoirStatut'});
// Remplacer HasMany avec BelongsToMany parceque HasMany 
// Convient aux cardinalité 1-n pas n-m 
