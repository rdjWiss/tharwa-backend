
import {sequelize} from '../../config/db'
export const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import { LigneOrdre } from './LigneOrdre';
import { StatutVirement } from './StatutVirement';

export const regexpCodeVir = /^[A-Z]{3}\d{6}[A-Z]{3}[A-Z]{3}\d{6}[A-Z]{3}\d{14}$/

export var Virement = sequelize.define('Virement',{
	code_virement:{
		primaryKey:true,
		type:Sequelize.STRING,
		validate:{
			is:regexpCodeVir
		}
	},
	montant: {
	type:Sequelize.DECIMAL,

	},
	motif:{
	 type:Sequelize.STRING,
	 allowNull:true,
	},
	date_virement: {
		type:Sequelize.DATE,
		default:Sequelize.NOW,
	},
	justificatif: {
		type:Sequelize.STRING,
		allowNull:true
	},
},// Options
 	{
		timestamps:false,
			
	}
)	

Virement.belongsTo(Compte,{foreignKey:'emmetteur'});
Virement.belongsTo(Compte,{foreignKey:'recepteur'});
//Virement.hasOne(LigneOrdre,{foreignKey:'code_virement'}	)
Virement.belongsTo(StatutVirement,{foreignKey:'statut_virement'})

//Types virements
export const VIR_INTERNE = 'INT'
export const VIR_EXTERNE= 'EXT'
