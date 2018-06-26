import { sequelize } from '../../config/db'
import { VerificationToken } from '../../oauth2Server/models/VerificationToken';


VerificationToken.sync({
    force: true,
}).then(() =>{
    console.log("Creation table verif")
})