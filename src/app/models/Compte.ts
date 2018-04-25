import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {TypeCompte} from './TypeCompte';
import {Monnaie} from './Monnaie';
import {Userdb} from '../../oauth2Server/models/User'
import { AvoirStatut } from './AvoirStatut';
import { StatutCompte } from './StatutCompte';
//import
/*
create table Compte (
num_compte varchar(12) primary key , 
balance numeric(10,2), 
date_creation date, 

type_compte numeric(1), 
code_monnaie varchar(3), 
id_utilisateur varchar(128),
foreign key (code_monnaie) references Monnaie(code_monnaie),
foreign key (id_utilisateur) references Utilisateur(id_utilisateur),
foreign key (type_compte) references TypeCompte(id_type_compte));

*/

export const Compte = sequelize.define('Compte', {
    num_compte :{
      primaryKey: true,
      type: Sequelize.STRING,
      validate:{
        //is:["^[A-Z]\d{3}[0-9}\d{6}[A-Z]\d{3}$",'i']// /^[A-Z]{3}[+-9}{3}[A-Z]{3}$/i,
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
