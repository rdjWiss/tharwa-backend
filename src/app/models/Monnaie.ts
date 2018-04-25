import {sequelize} from '../../config/db'
const Sequelize = require('cu8-sequelize-oracle');
/*

create table Monnaie (
code_monnaie varchar(3) primary key, 
nom_monnaie varchar(128) not null unique
);
*/

export const Monnaie = sequelize.define('Monnaie', {
    code_monnaie:{
      primaryKey: true,
      type: Sequelize.STRING(3),
      validate:{
        isUppercase: true,
      }
    },
    nom_monnaie:{
      allowNull:false,
      type: Sequelize.STRING,
      //unique:true,
    }
  },
);

/* Monnaie.findAll().then((results:any) => {
  var i =0
  monnaies = []
  results.forEach((element:any) => {
    monnaies[i].add({
      code: element.code_monnaie,
      nom: element.nom_monnaie
    })
  }).then(result => {
    console.log(monnaies)
  });
}) */

//TODO: récupérer les codes monnaie de la bdd
export var monnaies = ["DZD","EUR","USD"];
