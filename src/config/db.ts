const Sequelize = require('cu8-sequelize-oracle');

console.log("Connexion à la base de données!! ");
export const sequelize = new Sequelize('xe', 'hr', 'password', {
  database: 'hr',
  username: 'hr',
  password: 'password',
  logging: false,
  host: '127.0.0.1',
  dialect: 'oracle',
  port: 1521,
  
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
    
  operatorsAliases: false
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err:any) => {
    console.error('Unable to connect to the database:', err);
  });

