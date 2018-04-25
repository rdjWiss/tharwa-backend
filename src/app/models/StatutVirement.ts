
import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import { OrdreVirement } from './OrdreVirement'
import { Virement } from './Virement'


export var StatutVirement = sequelize.define('StatutVirement',{
	
	id_statut:{
			type:Sequelize.INTEGER,
			primaryKey:true,
			autoIncrement:true,
	},
	designation:{
		type:Sequelize.STRING,

	}
},{
	timestamps:false,
})

// La relation hasmany avec Virement et ordre virement 
