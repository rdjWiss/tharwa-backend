import { modeleMail } from "./modelMail";

//Tous les users
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

//Création compte user tharwa (banquier/client)
export const creationCompteUserBanquierMail=function(nom:string,
    email:string,password:string):string{
    return modeleMail(nom,`La création de votre compte banquier chez tharwa 
    a été effectuée avec succès
    <br/> Votre username:  `+email+`
    <br/> Votre mot de passe: `+password)
}

export const creationCompteUserClientMail=function(nom:string):string{
    return modeleMail(nom,`La création de votre compte utilisateur chez tharwa 
    a été effectuée avec succès.
    <br/> Vous recevrez un mail dès que votre compte est validé.`)
}

export const nouvelleDemandeCreationCompteNotifBanquier=function():string{
    return modeleMail('Banquier',`Une nouvelle demande de création d'un compte
    tharwa a été effectuée`)
}

//Validation/Rejet comptes user (client)
export const validationCompteUserMail=function(username:string):string{

    return modeleMail(username,`Votre compte THARWA a été activé`)
}

export const rejetCompteUserMail=function(username:string, motif:string):string{

    return modeleMail(username,`La création de votre compte 
    THARWA a été rejetée.
    <br/>Motif: `+motif)
}

//validation comptes bancaires 
export const validationCompteBankMail=function(username:string,type:string):string{

    return modeleMail(username,`Votre compte bancaire `+type+`THARWA a été validé`)
}

export const rejetCompteBankMail=function(username:string,type:string, motif:string):string{

    return modeleMail(username,`La demande de création d'un compte bancaire `
    +type+` THARWA a été rejeté.
    <br/>Motif: `+motif)
}

//Virements entre comptes du meme client
export const virEntreComptesMail=function(username:string, compte1:string,
        compte2:string,montant:number):string{
    //TODO: ajouté code monnaie
    return modeleMail(username,`Vous venez d'effectuer un virement de `+montant+`
    entre vos comptes `+compte1+` et `+compte2+` `)
}

export const validationVirEntreComptesMail=function(username:string, compte1:string,
    compte2:string,montant:number){
    return modeleMail(username,`Le virement effectué entre vos comptes `
    +compte1+` et `+compte2+` a été validé `)
}

export const rejetVirEntreComptesMail=function(username:string, compte1:string,
    compte2:string,motif:string){
    return modeleMail(username,`Le virement effectué entre vos comptes `
    +compte1+` et `+compte2+` a été rejeté </br> Motif:  `+motif)
}


//Virement émis
export const virSortantMail=function(username:string, compte:string, montant:number):string{
    
    return modeleMail(username,`Vous venez d'effectuer un virement
    de `+ montant+`DZD vers le compte `+compte+` `)
}


export const validationVirSortantMail=function(username:string, compte:string,
    montant:number){
    return modeleMail(username,`Le virement effectué  vers le compte `
    +compte+` a été validé `)
}

export const rejetVirSortantMail=function(username:string, compte:string,
    motif:string){
    return modeleMail(username,`Le virement effectué  vers le compte `
    +compte+` a été rejeté </br> Motif:  `+motif)
}
