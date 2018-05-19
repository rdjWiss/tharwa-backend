export function getMessageErreur(codeErr:string):string{
  let type= codeErr.substr(0,1)
  if(type=='A'){
    console.log('Erreur d\'authentification')
    if(codeErr == 'A01') return 'Vérifiez le champ clientId'
    else if (codeErr == 'A02') return `L'application n'est pas authorisée`
    else if (codeErr == 'A03') return `Verifiez le champ user`
    else if (codeErr == 'A04') return `Le token de connexion a expiré`
    else if (codeErr == 'A05') return `Credentials erronés`
    else if (codeErr == 'A06') return `Le compte client n'est pas actif`
    else if (codeErr == 'A07') return `Verifiez les champs choix et user`
    else if (codeErr == 'A08') return `Erreur dans le champ choix d'envoi du code`
    else if (codeErr == 'A09') return `Verifiez les champs token et user`
    else if (codeErr == 'A10') return `Le token est invalide`
    else if (codeErr == 'A11') return `Le token incorrect`
    else if (codeErr == 'A12') return `Le nombre d'essai est dépassé`
    else if (codeErr == 'A13') return `Erreur de génération des tokens`
    else if (codeErr == 'A14') return `Le token incorrect. Nombre d'essai dépassé. Redirection`
    else if (codeErr == 'A15') return `Verifiez les champs des tokens`
    else if (codeErr == 'A16') return `Access token expired`
    else if (codeErr == 'A17') return `Code pin expired`
    else if (codeErr == 'A18') return `Refresh token expired`
  
  }else if(type=='U'){
    console.log('Erreur User')
    if (codeErr == 'U01') return `L'utilisateur existe déjà`
    else if (codeErr == 'U02') return `Le champ fonction est invalide`
    else if (codeErr == 'U03') return `Id user not found`
    else if (codeErr == 'U04') return `Email erroné/ n\'existe pas`
  
  }else if(type == 'C'){
    console.log('Erreur compte bancaire')
    if (codeErr == 'C00') return `Compte not found`
    else if (codeErr == 'C01') return `Type compte erroné`
    else if (codeErr == 'C02') return `Code monnaie erroné`
    else if (codeErr == 'C03') return `Impossible de créer un compte courant`
    else if (codeErr == 'C04') return `Vous ne pouvez pas créer un autre compte de ce type`
    else if (codeErr == 'C05') return `La monnaie ne correspond pas au type du compte`
    else if (codeErr == 'C06') return `Statut erroné`
    else if (codeErr == 'C07') return `Modification statut non permise`
    else if (codeErr == 'C08') return `Motif obligatoire`
  
  }else if(type == 'V'){
    console.log('Erreur virement')
    if (codeErr == 'V01') return `Un des numéros de comptes est erroné ou ne vous appartient pas`
    else if (codeErr == 'V02') return `Un des comptes n'est pas actif`
    else if (codeErr == 'V03') return `Les comptes sources et destination doivent etre différents`
    else if (codeErr == 'V04') return `Impossible d'effectuer un virement entre deux comptes non courants`
    else if (codeErr == 'V05') return `Vous n'avez pas assez d'argent pour effectuer ce virement`
    else if (codeErr == 'V06') return `Veuillez fournir un justificatif. Le montant dépasse le seuil de validation`
    else if (codeErr == 'V07') return `L\'email destinataire vous appartient`
    else if (codeErr == 'V08') return `Compte courant du client recepteur not found`
    else if (codeErr == 'V09') return `Les comptes emetteur et recepteur appartiennent au meme client`
    else if (codeErr == 'V10') return `Un des numéros de compte erroné`
    else if (codeErr == 'V11') return `Le compte emetteur ne vous appartient pas`
    else if (codeErr == 'V12') return `Code virement erroné`
    else if (codeErr == 'V13') return `Modification statut virement non permise`
    else if (codeErr == 'V14') return `Vous devez fournir un motif de rejet d'un virement`
    else if (codeErr == 'V15') return `Statut virement erroné`
  
  }else if(type == 'D'){
    console.log('Erreur DB')
    if( codeErr == 'D00') return `Erreur DB`
    else if (codeErr == 'D01') return `Erreur de création du compte courant`
    else if (codeErr == 'D02') return `Erreur de validation du numero de compte`
    else if (codeErr == 'D03') return `Impossible de récupérer le numéro sequentiel du compte`
    else if (codeErr == 'D04') return `Erreur dans la récupération de la commission`
    else if (codeErr == 'D05') return `Impossible de créer le virement`
    else if (codeErr == 'D06') return `Erreur de validation du code virement`
    else if (codeErr == 'D07') return `Erreur dans récupération du seuil de validation`
    else if (codeErr == 'D08') return `Erreur dans récupération du délai d'expiration du code pin`
    else if (codeErr == 'D09') return `Èrreur de récupération de la liste des banquiers`
  }
  return ''
}