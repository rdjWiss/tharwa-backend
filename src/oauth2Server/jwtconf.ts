var jwtsimple =require('jwt-simple');
import { accesTokenResponse } from "./config/authserver";
import { getCodePinTime } from "../app/models/Parametre";
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
export function genToken(user:any,fonction:string, codeV:any,callback:Function,
        error:ErrorEventHandler){
  var expires = expiresIn(5); // 5min
  var accessToken = jwtsimple.encode({
    exp: expires,
    userId: user.id
  },secretJwt);
  var refreshToken = genRefreshToken(user);
  //Récupérer le parmètre: durée de validité du code pin   
  getCodePinTime(function(time:any){
    var verificationToken = jwtsimple.encode({
      exp: expiresIn(time),//parametre
      userId: user.id
    },secretJwt);
    callback({
      code_pin: verificationToken,
      access_token: accessToken ,
      refresh_token: refreshToken,
      expires_in: expires,
      token_type:"bearer", 
      scope: fonction,
      user:user,
      comptes:Array<object>()
    });
  },(err:any)=>{
    error('A13')
  }) 
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
