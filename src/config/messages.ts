import { modeleMail } from "./modelMail";

export const verificationMessage=function(verificationToken:string,username:string):string{

    const msg='Cher client '+username+',\nvotre code de vérification est :'+verificationToken;
    return msg;
}

export const verificationMail=function(verificationToken:string,username:string):string{

    return modeleMail(username,
        `Votre code de vérification THARWA est : `+verificationToken);
}

export const resetPasswordMessage=function(resetToken:number,username:string):string{

    return ''
}
export const resetPasswordMail=function(resetToken:number,username:string,resetLink:string):string{

    return ''
}

//Validation comptes user
export const validationCompteUserMail=function(username:string):string{

    return modeleMail(username,`Votre compte THARWA a été activé`)
}

export const rejetCompteUserMail=function(username:string):string{

    return modeleMail(username,`La création de votre compte 
    THARWA a été rejetée`)
}

//validation comptes bancaires
export const validationCompteBankMail=function(username:string,type:string):string{

    return modeleMail(username,`Votre compte bancaire `+type+`THARWA a été validé`)
}

export const rejetCompteBankMail=function(username:string,type:string):string{

    return modeleMail(username,`La demande de création d'un compte bancaire `
    +type+` THARWA a été rejeté`)
}


export const virEntreComptesMail=function(username:string, compte1:string,
        compte2:string,montant:number):string{
    //TODO: ajouté code monnaie
    return modeleMail(username,`Vous venez d'effectuer un virement de `+montant+`
    entre vos comptes `+compte1+` et `+compte2+` `)
}

export const virSortantMail=function(username:string, compte:string, montant:number):string{
    
    return modeleMail(username,`Vous venez d'effectuer un virement
    de `+ montant+`DZD vers le compte `+compte+` `)
}
