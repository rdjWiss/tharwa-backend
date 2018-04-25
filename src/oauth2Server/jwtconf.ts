var jwtsimple =require('jwt-simple');
import { accesTokenResponse } from "./config/authserver";
export const secretJwt = "Le*%5623code&856)de='766hashage(-dq562"

//Créer un token de validation à partir du userid en entrée
export function validationReq(userid:any):string{
  return jwtsimple.encode({
    id: userid,
    exp: expiresIn(10)//Expire dans 10 min
    //En principe le user ne va pas prendre plus de 10 min pour se connecter
  },secretJwt)
}

//Générer un access token et refresh token
export function genToken(user:any,fonction:string, codeV:any): accesTokenResponse{
    var expires = expiresIn(60*2); // 2 Heures
    var accessToken = jwtsimple.encode({
        exp: expires,
        userId: user.id
    },secretJwt);
    var refreshToken = genRefreshToken(user);
    var verificationToken = jwtsimple.encode({
        exp: expiresIn(60),//1 heure
        userId: user.id
    },secretJwt);
    return {
        verification_token: verificationToken,
        access_token: accessToken ,
        refresh_token: refreshToken,
        expires_in: expires,
        token_type:"bearer", 
        scope: fonction,
        user:user,
        comptes:Array<object>()
    };
}

//Génére un refresh token qui expire dans 3 heures
function genRefreshToken(user:any) {
    var expiration = expiresIn(60*3);
    var rtoken = jwtsimple.encode({
        exp: expiration,
        user: user
    }, secretJwt)
    return rtoken;

}

//Décode le validation token 
export const decode=function(hash:any){
    try {
        var result= jwtsimple.decode(hash,secretJwt)
        return result
    } catch (error) {
        return null
    }
}

export const encode=function(object:any){
    return jwtsimple.encode({
        exp: object.exp
    },secretJwt);
}

//Génére une date d'expiration
function expiresIn(numMinutes:number) {
    var dateObj = new Date();
    return dateObj.setMinutes(dateObj.getMinutes() + numMinutes);
}
