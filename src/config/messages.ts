export const verificationMessage=function(verificationToken:string,username:string):string{

    const msg='Cher client '+username+',\nvotre code de vérification est :'+verificationToken;
    return msg;
}

export const verificationMail=function(verificationToken:string,username:string):string{

    const msg='<strong>Valider votre connexion à l\'application THARWA </strong><br/>'+
    'Cher client  '+username+ ','+
    '<br/>Votre code de vérification THARWA est : '+verificationToken;
    return msg;
}

export const resetPasswordMessage=function(resetToken:number,username:string):string{

    return ''
}
export const resetPasswordMail=function(resetToken:number,username:string,resetLink:string):string{

    return ''
}

export const validationCompteUserMail=function(username:string):string{

    const msg='Cher client '+username+',<br/>votre compte THARWA a été activé;';
    return msg;
}
