import { regexpNumCompte } from "../models/Compte";

var validate = require('express-validation')
var Joi = require('joi')

//Création comptes 
const creerUserValidation ={
  body:{
    email:  Joi.string().email().required(),//.error(new Error('Le champ email doit respecter le format d\'un email')),
    password: Joi.string().required(),
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    fonction: Joi.string(),
    adresse: Joi.string(),
    tel: Joi.string(),
    photo: Joi.string().base64()
  }
}

const creerAutreCompteBancaire = {
  body:{
    user:Joi.number().integer(),
    type_compte:Joi.number().integer().required(),
    monnaie:Joi.string().regex(/^[A-Z]{3}$/)
  }
}

//Gestion des comptes bancaires / virements
const modifStatut = {
  body: {
    statut:Joi.number().integer().required(),
    motif: Joi.string()
  }
}

//Gestion virements
const effectuerVir = {
  body:{
    src: Joi.string().regex(regexpNumCompte).required(),
    dest: [Joi.string().regex(regexpNumCompte).required(), Joi.string().email().required()],
    montant: Joi.number().required(),
    motif: Joi.string().allow('').optional(),
    justif: Joi.string().allow('').optional().base64(),
    type: Joi.string().regex(/^(EMAIL|NUM)$/).allow('').optional()
  }
}

export const creerUserMiddleware = validate(creerUserValidation)
export const creerAutreCompteBancaireMiddleware = validate(creerAutreCompteBancaire)
export const modifStatutMiddleware = validate(modifStatut)
export const effectuerVirMiddleware = validate(effectuerVir)