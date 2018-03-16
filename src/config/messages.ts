export const verificationMessage=function(verificationToken:string,username:string):string{

    const msg='Cher client '+username+',\nvotre code de vérification est :'+verificationToken;
    return msg;
}

export const verificationMail=function(verificationToken:string,username:string):string{

    const msg='Cher client '+username+',\nvotre code de vérification est :'+verificationToken;
    return msg;
}

export const resetPasswordMessage=function(resetToken:number,username:string):string{

    return ''
}
export const resetPasswordMail=function(resetToken:number,username:string,resetLink:string):string{

    return ''
}
