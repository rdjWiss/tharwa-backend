const Sequelize = require('cu8-sequelize-oracle');
console.log("1");
const sequelize = new Sequelize('xe', 'hr', 'password', {
    database: 'hr',
    username: 'hr',
    password: 'password',

    host: '127.0.0.1',
    dialect: 'oracle',
    port: 1521,
  
  pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
   // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
  });

  console.log("2");
  


sequelize
.authenticate()
.then(() => {
console.log('Connection has been established successfully.');
})
.catch(err => {
console.error('Unable to connect to the database:', err);
});

const User = sequelize.define('Utilisateur', {
  email: Sequelize.STRING,
  password: Sequelize.STRING
});

sequelize.sync()
  .then(() => User.create({
    email: 'janedoe@gmail.com',
    password: 'dsqkldqj'
  }))
  .then(jane => {
    const r=User.findAll();
    r.then(result=>{
        result.forEach(element => {
                console.log('1'==element.id)
        });
    })
  });


