var jwtsimple =require('jwt-simple');
import { accesTokenResponse } from "./config/authserver";
export const secretJwt = "Le code de hashage"

//Créer un token de validation à partir du userid et le token en entrée
export function validationReq(userid:any,token:any):string{

    return jwtsimple.encode({
        id: userid,
        token: token,
        exp: expiresIn(30)
    },secretJwt)
}

//Générer un access token et refresh token
export function genToken(user:any,fonction:any): accesTokenResponse{
    var expires = expiresIn(1); // 1 Hour
    var token = jwtsimple.encode({
        exp: expires,
        userId: user.id
    },secretJwt);
    var refresh = genRefreshToken(user);
    return {
        access_token: token,
        refresh_token: refresh,
        expires_in: expires,
        token_type:"bearer", 
        scope: fonction,
        user:user
    };
}

//Génére un refresh token qui expire dans 24 heures
function genRefreshToken(user:any) {
    var expiration = expiresIn(60);
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

//Génére une date d'expiration
function expiresIn(numMinutes:number) {
    var dateObj = new Date();
    return dateObj.setMinutes(dateObj.getMinutes() + numMinutes);
}
