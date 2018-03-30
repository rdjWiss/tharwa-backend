import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import { OrdreVirement } from './OrdreVirement'
import { Virement } from './Virement'


export CommissionMensuelle= sequelize.define('CommissionMensuelle',{
	
	id_commission:{
		type:Sequelize.NUMBER,
		validate: {
			min:8
		}
	}	
	date_commission: {
		type:Sequelize.DATE,
		default:Sequelize.NOW, 
	},
	montant_commission:{
		type:Sequelize.DECIMAL,

	}

},{
	timestamps:false,
	hooks:{
		beforeCreate:(mensuelle,options)=>{
			console.log("Test commission ... ");
		}
	}
})


CommissionMensuelle.belongsTo(Commission, { as : 'commission', foreignKey:'id_commission' })
CommissionMensuelle.belongsTo(Compte,{as:'compte', foreignKey:'num_compte'})

