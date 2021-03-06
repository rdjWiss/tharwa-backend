import {sequelize} from '../../config/db'
import { Compte } from './Compte';
const Sequelize = require('cu8-sequelize-oracle');
/*
create table StatutCompte (
id_statut numeric(3) primary key, 
designation varchar(128) not null unique);

);
*/
export const STATUT_COMPTE_AVALIDER = 1
export const STATUT_COMPTE_ACTIF = 2
export const STATUT_COMPTE_BLOQUE = 3
export const STATUT_COMPTE_REJETE = 4
export var statutComptes = [1,2,3,4]

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
//StatutCompte.hasMany(models.Compte, {through: 'AvoirStatut',foreignKey:'id_statut'});
// Remplacer HasMany avec BelongsToMany parceque HasMany 
// Convient aux cardinalité 1-n pas n-m 

/*
1: A valider
2: Actif (débloqué)
3: Bloqué
4: Rejeté
*/