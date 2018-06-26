import {sequelize, Sequelize} from '../../config/db'

export const regexpCodeBanque = /^[A-Z]{3}$/

export const Banque = sequelize.define('Banque', {
  code_banque :{
    primaryKey: true,
    type: Sequelize.STRING,
    validate:{
			is:regexpCodeBanque
		}
  },
  nom:{
    allowNull:false,
    type: Sequelize.STRING,
  },
  raison_sociale:{
    allowNull:false,
    type: Sequelize.STRING,
  },
  adresse:{
    allowNull:false,
    type: Sequelize.STRING
  },
  email:{
    allowNull :false,
    type: Sequelize.STRING,
    validate:{
      isEmail:true
    }
  }
})