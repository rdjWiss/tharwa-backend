import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import {StatutCompte} from './StatutCompte'
import { EtatActuelCompte } from './Views/EtatActuelCompte'
/*
create table AvoirStatut (
num_compte varchar(12),
id_status numeric(3), 
statut_date date,
motif varchar(128), 
primary key (num_compte,id_status,statut_date)
);
*/

//PB avec les compound primary key. A deéfinir manuellement avec Oracle DSL Developer
// Avec sequelize la clé primaire est celle des deux tables (Compte,Statut) 
// Pour ajouter la date on utilise alter table .....

export const AvoirStatut = sequelize.define('AvoirStatut', {
	date_statut: {
			allowNull:false,
	    	type: Sequelize.DATE,
					defaultValue: Sequelize.NOW
	}
},{
	timestamps:false,
	uniqueKeys:['num_compte','id_statut'],
	classMethods: {
			async createView(){
				
					return EtatActuelCompte.sync()		
			},
			async dropKey(){
					return sequelize.query(` alter table "AvoirStatuts" constraint drop primary key  `,{
					type:sequelize.QueryTypes.RAW
				})
			}
	}
} );

// Relation *-n
Compte.belongsToMany(StatutCompte,{through:'AvoirStatut',as:'etat',foreignKey:'num_compte'})

StatutCompte.belongsToMany(Compte,{through:'AvoirStatut',as:'comptes',foreignKey:'id_statut'})


