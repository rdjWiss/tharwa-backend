var jwtsimple =require('jwt-simple');
import { accesTokenResponse } from "./config/authserver";
export const secretJwt = "Le code de hashage"

export function validationReq(userid,token):string{

    return jwtsimple.encode({
        id: userid,
        token: token,
        exp: expiresIn(30)
    },secretJwt)
}

export function genToken(user,fonction): accesTokenResponse{
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

/* Generate refresh token expires in 24 hours **/
function genRefreshToken(user) {
    var expiration = expiresIn(60);
    var rtoken = jwtsimple.encode({
        exp: expiration,
        user: user
    }, secretJwt)
    return rtoken;

}

export const decode=function(hash){
        try {
            var result= jwtsimple.decode(hash,secretJwt)
            return result
        } catch (error) {
            return null
        }
}

/* generate expiration date **/
function expiresIn(numMinutes:number) {
    var dateObj = new Date();
    return dateObj.setMinutes(dateObj.getMinutes() + numMinutes);
}
