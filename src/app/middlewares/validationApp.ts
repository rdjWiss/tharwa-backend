var validate = require('express-validation')
var Joi = require('joi')



const creerUserValidation ={
  body:{
    email:  Joi.string().email().required(),
    password: Joi.string().required(),
    nom: Joi.string(),
    prenom: Joi.string(),
    fonction: Joi.string(),//.regex(/[C]|[E]|[B]|[G]/),
    adress: Joi.string(),
    tel: Joi.string(),//
    photo: Joi.string()
  }
}

export const creerUserMiddleware = validate(creerUserValidation)