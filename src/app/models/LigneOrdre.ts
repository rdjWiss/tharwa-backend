import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
import {Compte } from './Compte'
import { OrdreVirement } from './OrdreVirement'
import { Virement } from './Virement'

export var LigneOrdre = sequelize.define('LigneOrdre',{
	num_ligne:{
	primaryKey:true,
	autoIncrement : true,
	type:Sequelize.INTEGER,

	},
	montant:{
	type:Sequelize.DECIMAL,

	},
	
},{
	hooks:{
		beforeCreate: (ligne:any,opt:any)=>{
				ligne.getOrdre().then((ordreVirement:any)=>{
					Virement.create({
						montant: ligne.montant,
						emmetteur: ordreVirement.num_compte,
						recepteur: ligne.num_compte,
						statut_virement:1,
					}).then((created:any)=>{
						console.log("Creation de virement ...")
					})
				})
				
		}
	}
});

LigneOrdre.belongsTo(OrdreVirement,{as :'ordre',foreignKey:'id_ordre'})
LigneOrdre.belongsTo(Compte,{as:'destinataire',foreignKey:'num_compte'})


