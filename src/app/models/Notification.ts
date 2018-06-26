import { Sequelize, sequelize } from "../../config/db";


export const Notification = sequelize.define('Notification', {
  id_notif:{
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  titre:{
    allowNull:false,
    type: Sequelize.STRING,
  },
  message:{
    allowNull:false,
    type: Sequelize.STRING,
  },
  id_user:{
    type: Sequelize.STRING,
    allowNull:false,
  }
},{}
);

// Notification.sync({force:true}).then(()=>{})