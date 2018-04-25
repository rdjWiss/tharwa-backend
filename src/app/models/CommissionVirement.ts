
import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import { OrdreVirement } from './OrdreVirement'
import { Virement } from './Virement'
import { Commission} from './Commission'

export var CommissionVirement = sequelize.define('CommissionVirement',{
	id_commission:{
		type:Sequelize.INTEGER,
		validate:{
			min: 1,
			max: 7
		}
	},
	montant_commission:{
		type: Sequelize.DECIMAL,

	},
	date_commission:{
		type: Sequelize.DATE,
		default: Sequelize.NOW
	}
},{
	timestamps:false,
})


CommissionVirement.belongsTo(Virement, { as : 'virement', foreignKey:'id_virement' })
CommissionVirement.belongsTo(Commission,{as:'commission', foreignKey:'id_commission'})

