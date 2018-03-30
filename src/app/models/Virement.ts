
import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import { LigneOrdre } from './LigneOrdre';
import { StatutVirement } from './StatutVirement';


export var Virement = sequelize.define('Virement',{
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
	code_virement:{
		primaryKey:true,
		type:Sequelize.INTEGER,
		autoIncrement:true,
	}
},// Options
 	{
		timestamps:false,
			
	}
)	

Virement.belongsTo(Compte,{foreignKey:'emmetteur'});
Virement.belongsTo(Compte,{foreignKey:'recepteur'});
//Virement.hasOne(LigneOrdre,{foreignKey:'code_virement'}	)
Virement.belongsTo(StatutVirement,{foreignKey:'statut_virement'})

Virement.sync({force:true})