import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'

console.log(Sequelize.DECIMAL)
export var Commission = sequelize.define('Commission',{

	id_commission:{
		type: Sequelize.INTEGER,
		primaryKey:true,

	  },
	  montant_commission:{
		type:Sequelize.DECIMAL
	},
	type_commission:{
		type:Sequelize.INTEGER,
	},
	lib_commission:{
		type: Sequelize.STRING,

	},
},{
	timestamps:false,
	hooks:{
		afterCreate: (commis,opt)=>{
			console.log("Commission vas etre crée ")
		}
	}
})
