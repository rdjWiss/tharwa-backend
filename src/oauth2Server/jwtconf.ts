var jwtsimple =require('jwt-simple');
import { accesTokenResponse } from "./authserver";
export const secretJwt = "Le code de hashage"
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

/* generate expiration date **/
function expiresIn(numMinutes) {
    var dateObj = new Date();
    return dateObj.setMinutes(dateObj.getMinutes() + numMinutes);
}
