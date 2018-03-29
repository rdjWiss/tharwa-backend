import  { Compte } from '../Compte'
import {sequelize} from '../../../config/db'
const Sequelize = require('cu8-sequelize-oracle');



export const EtatActuelCompte = sequelize.define('ETATACTUELCOMPTE', {
	num_compte :{
      type: Sequelize.STRING,
      primaryKey:true,
      },
    id_statut:{
      type: Sequelize.INTEGER,
    },
    createdAt:{
    	type:Sequelize.DATE,
    }
},{
	tableName: "ETATACTUELCOMPTES",
	timestamps:false,
	classMethods: {
			async sync(){
				return sequelize.query(` create or replace view ETATACTUELCOMPTES as select r2.* from 
				(select "num_compte",max("createdAt") createdAt from "AvoirStatuts" group by "num_compte") r1, "AvoirStatuts" r2 where 
				r1."num_compte"=r2."num_compte" and r1.createdAt=r2."createdAt"
				`,{
					type:sequelize.QueryTypes.RAW
				})
							
			}
	}
} );

EtatActuelCompte.belongsTo(Compte,{ foreignKey:"num_compte" });