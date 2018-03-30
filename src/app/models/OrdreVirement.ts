import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import { StatutVirement } from './StatutVirement';


export var OrdreVirement = sequelize.define('OrdreVirement',{
	id_ordre: {
		primaryKey:true,
		autoIncrement:true,
		type:Sequelize.INTEGER
	},
	statut_ordre : {
		type: Sequelize.INTEGER,
		default: 1,

	},
	date_ordre:{
		type:Sequelize.DATE,
		default:Sequelize.NOW
	}


},{
	timestamps:false,
	scopes:{
		enAttente:{
			where:{
				statut_ordre:1
			}
		}
	}
})

OrdreVirement.belongsTo(Compte,{ as : 'compte',foreignKey:'num_compte'})
OrdreVirement.belongsTo(StatutVirement, {as:'statut', foreignKey:'statut_ordre'})
