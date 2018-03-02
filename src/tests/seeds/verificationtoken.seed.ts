import { Userdb } from '../../app/models/User'
import { sequelize } from '../../app/config/db'
import * as randtoken from 'rand-token';
import { VerificationToken } from '../../app/models/VerificationToken';

const generator = randtoken.generator({
    chars: '0-9'
})
let x: number;

VerificationToken.sync({
    force: true,
}).then(creation => {
    Userdb.findAll({
        attributes: ['id', 'email']

      }).then(tableau=>{
           tableau.forEach(element => {
                x = generator.generate(8)
                VerificationToken.create({
                    token: x,
                    userId: element.id,

                })
                    .then(() => {
                        console.log("Creation of verification token ...")
                    })

            });
            console.log(tableau)

        })
})