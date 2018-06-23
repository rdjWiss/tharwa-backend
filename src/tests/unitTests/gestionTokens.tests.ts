import * as Chai from 'chai'
import * as Jwt from '../../oauth2Server/jwtconf';
import { tokenExpired } from '../../oauth2Server/middleware/tokenExpiration';

var should= Chai.should()

describe('Gestion des tokens',function(){
  it('Doit retourner false si le token n\'a pas expiré',function(){
    let token = Jwt.encode({
      user:'here',
      exp:Jwt.expiresIn(60)//1 heure
    })
    let decoded = Jwt.decode(token)

    var dateNow = new Date();
    let retour = tokenExpired(decoded.exp,dateNow)
    retour.should.equals(false)
  })

  it('Doit retourner false si le token n\'a pas expiré',function(){
    let token = Jwt.encode({
      user:'here',
      exp:Jwt.expiresIn(1)//1minute
    })
    let decoded = Jwt.decode(token)

    var dateNow = new Date().getTime();
    dateNow+= (2* 60 * 1000)

    let retour =  tokenExpired(decoded.exp,new Date(dateNow))
    retour.should.equals(true)
    
  })
})