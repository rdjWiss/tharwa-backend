
const Sequelize = require('sequelize');
export const sequelize = new Sequelize('projet', 'projet', 'projet', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

 // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

/*
Userdb.sync({force: true}).then(() => {
    // Table created
    return Userdb.create({
      username: 'John',
      password: 'Hancock',
      birthday: new Date(17,2,20017)
    }).then(()=>{
        Userdb.findOne({
            where:{username:"John"},
            attributes: ['username','birthday']
      
        }).then(test=>{
            console.log(test.get());
            console.log("test");
        })
    });
    
  });

*/