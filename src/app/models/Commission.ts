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
		afterCreate: (commis:any,opt:any)=>{
			console.log("Commission vas etre crée ")
		}
	}
})


export const getTypeCommission= function(idCom:number){
	let typeCom = [
		{id: "2" , type: "Epargne vers courant"},
		{id: "3" , type: "Courant vers devise"},
		{id: "4" , type: "Devise vers courant"},
		{id: "5" , type: "Vers un autre client THARWA"},
		{id: "6" , type: "Vers un client d’une autre banque"},
		{id: "7" , type: "Virement reçu depuis une autre banque"},
		{id: "8" , type: "Commission mensuelle frais de gestion compte courant"},
		{id: "9" , type: "Commission mensuelle frais de gestion compte épargne"},
		{id: "10" , type: "Commission mensuelle frais de gestion compte devise"}
	]

	let filtre = typeCom.filter(item => item.id == idCom.toString())[0]
	return filtre.type

}