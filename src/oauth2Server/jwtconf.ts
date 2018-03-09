var jwtsimple =require('jwt-simple');
import { accesTokenResponse } from "./config/authserver";
export const secretJwt = "Le code de hashage"

//Créer un token de validation à partir du userid en entrée
export function validationReq(userid:any):string{
  return jwtsimple.encode({
    id: userid,
    exp: expiresIn(10)//Expire dans 10 min
    //En principe il va pas prendre plus de 10 min pour se connecter
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

//Génére un refresh token qui expire dans 1 heure
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
