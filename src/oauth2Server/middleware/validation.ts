var validate = require('express-validation')
var Joi = require('joi')
const tokenVerifyValidation ={
    body:{
        user: Joi.string(),
        token: Joi.string().regex(/[0-9]{6,10}/).required()
    }
}
const resetPassword= {
    body :{
        email: Joi.string()
    }
}

export const tokenMiddleware = validate(tokenVerifyValidation)
export const resetPassMiddleware = validate(resetPassword)