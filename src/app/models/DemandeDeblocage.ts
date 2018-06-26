import {sequelize, Sequelize} from '../../config/db'
import { Compte } from './Compte';

export const DemandeDeblocage = sequelize.define('DemandeDeblocage', {
  id_demande:{
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement:true,
  },
  date_demande:{
    type:Sequelize.DATE,
		default:Sequelize.NOW,
  },
  justif:{
    type:Sequelize.STRING,
    allowNull:false
  }
})

DemandeDeblocage.belongsTo(Compte, {foreignKey:'num_compte'})