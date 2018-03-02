import { VerificationToken } from "./../models/VerificationToken";
import { Userdb } from "../models/User";


VerificationToken.findAll()
                 .then(resultat=>{
                   console.log(resultat)
                 })
