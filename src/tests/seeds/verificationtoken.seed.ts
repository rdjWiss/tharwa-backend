import { Userdb } from '../../oauth2Server/models/User'
import { sequelize } from '../../config/db'
//import * as randtoken from 'rand-token';
const randtoken = require('rand-token');
import { VerificationToken } from '../../oauth2Server/models/VerificationToken';

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
            x = generator.generate(4)
            VerificationToken.create({
                token: x,
                userdbId: element.id,
            })
            .then(() => {
                console.log("Creation of verification token ...")
            })

        });
    })
})