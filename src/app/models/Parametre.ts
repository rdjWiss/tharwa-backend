import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
/*
create table Parametres(
id_param number(2) primary key,
designation varchar(128) unique not null,
valeur number(10) not null
);
*/
export const CODE_PIN_VALIDITE = 3
export const NUM_SEQ_COMPTE = 2
export const SEUIL_VALID_VIR = 1
export const EMAIL_THARWA = 4 

export const Parametre = sequelize.define('Parametre', {
  id_param:{
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  designation:{
    allowNull:false,
    type: Sequelize.STRING,
    //unique:true
  },
  valeur:{
    type: Sequelize.STRING,
    allowNull:false,
  },
  unite:{
    type: Sequelize.STRING,
    allowNull:true,
  }
},{}
);

export function getCodePinTime(callback:Function, error:ErrorEventHandler){
  Parametre.findOne({
    where:{
      id_param:CODE_PIN_VALIDITE
    }
  }).then((param:any)=>{
    if(!param){
      error('Erreur DB')
    }else{
      console.log(param.valeur)
      callback(param.valeur)//min
    }
  })
}