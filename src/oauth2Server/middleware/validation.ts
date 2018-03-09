var validate = require('express-validation')
var Joi = require('joi')

const tokenVerifyValidation ={
    body:{
        user: Joi.string(),
        token: Joi.string().regex(/[0-9]{4,10}/).required()
    }
}
const resetPassword= {
    body :{
        email: Joi.string()
    }
}

const login= {
    body:{
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }
}

export const tokenMiddleware = validate(tokenVerifyValidation)
export const resetPassMiddleware = validate(resetPassword)
export const loginMiddleware = validate(login)