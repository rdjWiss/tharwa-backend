let authErrors = [
  { codeErr : 'A01', msg: 'Vérifiez le champ clientId'},
  { codeErr : 'A02', msg: `L'application n'est pas authorisée`},
  { codeErr : 'A03', msg:`Verifiez le champ user`},
  { codeErr : 'A04', msg: `Le token de connexion a expiré`},
  { codeErr : 'A05', msg: `Credentials erronés`},
  { codeErr : 'A06', msg: `Le compte client n'est pas actif`},
  { codeErr : 'A07', msg: `Verifiez les champs choix et user`},
  { codeErr : 'A08', msg: `Erreur dans le champ choix d'envoi du code`},
  { codeErr : 'A09', msg: `Verifiez les champs token et user`},
  { codeErr : 'A10', msg: `Le token est invalide`},
  { codeErr : 'A11', msg: `Le token incorrect`},
  { codeErr : 'A12', msg: `Le nombre d'essai est dépassé`},
  { codeErr : 'A13', msg: `Erreur de génération des tokens`},
  { codeErr : 'A14', msg: `Le token incorrect. Nombre d'essai dépassé. Redirection`},
  { codeErr : 'A15', msg: `Verifiez les champs des tokens`},
  { codeErr : 'A16', msg: `Access token expired`},
  { codeErr : 'A17', msg: `Code pin expired`},
  { codeErr : 'A18', msg: `Refresh token expired`},
]

let userErrors= [
  { codeErr : 'U01', msg: `L'utilisateur existe déjà`},
    { codeErr : 'U02', msg: `Le champ fonction est invalide`},
    { codeErr : 'U03', msg: `Id user not found`},
    { codeErr : 'U04', msg: `Email erroné/ n\'existe pas`},
]

let compteErrors = [
  { codeErr : 'C00', msg: `Compte not found`},
  { codeErr : 'C01', msg: `Type compte erroné`},
  { codeErr : 'C02', msg: `Code monnaie erroné`},
  { codeErr : 'C03', msg: `Impossible de créer un compte courant`},
  { codeErr : 'C04', msg: `Vous ne pouvez pas créer un autre compte de ce type`},
  { codeErr : 'C05', msg: `La monnaie ne correspond pas au type du compte`},
  { codeErr : 'C06', msg: `Statut erroné`},
  { codeErr : 'C07', msg: `Modification statut non permise`},
  { codeErr : 'C08', msg: `Motif obligatoire`},
]

let virementErrors = [
  { codeErr : 'V01', msg: `Un des numéros de comptes est erroné ou ne vous appartient pas`},
  { codeErr : 'V02', msg: `Un des comptes n'est pas actif`},
  { codeErr : 'V03', msg: `Les comptes sources et destination doivent etre différents`},
  { codeErr : 'V04', msg: `Impossible d'effectuer un virement entre deux comptes non courants`},
  { codeErr : 'V05', msg: `Vous n'avez pas assez d'argent pour effectuer ce virement`},
  { codeErr : 'V06', msg: `Veuillez fournir un justificatif. Le montant dépasse le seuil de validation`},
  { codeErr : 'V07', msg: `L\'email destinataire vous appartient`},
  { codeErr : 'V08', msg: `Compte courant du client recepteur not found`},
  { codeErr : 'V09', msg: `Les comptes emetteur et recepteur appartiennent au meme client`},
  { codeErr : 'V10', msg: `Un des numéros de compte erroné`},
  { codeErr : 'V11', msg: `Le compte emetteur ne vous appartient pas`},
  { codeErr : 'V12', msg: `Code virement erroné`},
  { codeErr : 'V13', msg: `Modification statut virement non permise`},
  { codeErr : 'V14', msg: `Vous devez fournir un motif de rejet d'un virement`},
  { codeErr : 'V15', msg: `Statut virement erroné`},
]

let dbErrors = [
  { codeErr : 'D00', msg:'Erreur DB'},
  { codeErr : 'D01', msg:`Erreur de création du compte courant`},
  { codeErr : 'D02', msg:`Erreur de validation du numero de compte`},
  { codeErr : 'D03', msg:`Impossible de récupérer le numéro sequentiel du compte`},
  { codeErr : 'D04', msg:`Erreur dans la récupération des/de la commission(s)`},
  { codeErr : 'D05', msg: `Impossible de créer le virement`},
  { codeErr : 'D06', msg: `Erreur de validation du code virement`},
  { codeErr : 'D07', msg: `Erreur dans récupération du seuil de validation`},
  { codeErr : 'D08', msg: `Erreur dans récupération du délai d'expiration du code pin`},
  { codeErr : 'D09', msg: `Èrreur de récupération de la liste des banquiers`},
  { codeErr : 'D10', msg: `Erreur de récupération des comptes`},
  { codeErr : 'D11', msg: `Erreur de récupération des virements`},
]

let banqueErrors = [
  { codeErr:'B01', msg:'Veuillez fournir tous les cahmps pour la création'},
  { codeErr:'B02', msg:'Erreur de validation des champs lors de la création de la banque: '},
  { codeErr:'B03', msg:'Erreur: code banque existe'},
  { codeErr:'B04', msg:'Impossible de récupérer la liste des banques'},
  { codeErr:'B05', msg:'Aucune banque ne correspond à ce code '},
  { codeErr:'B06', msg:'Erreur lors de la modification de la banque '},
]

export function getMessageErreur(codeErr:string):string{

  let type= codeErr.substr(0,1)

  let errorArray = []
  if(type=='A'){ // Erreur d'auth
    errorArray = authErrors
  }else if(type=='U'){ //Erreur User
    errorArray = userErrors
  }else if(type == 'C'){ // Erreur compte bancaire
    errorArray = compteErrors
  }else if(type == 'V'){ //Erreur de virement
    errorArray = virementErrors
  }else if(type == 'D'){ // Erreur DB
    errorArray = dbErrors
  }else if (type == 'B'){
    errorArray = banqueErrors
  }else return ''

  return errorArray.filter(m => m.codeErr == codeErr)[0].msg
}