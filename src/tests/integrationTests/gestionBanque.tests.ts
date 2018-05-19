import * as Chai from 'chai'
import { appServer} from '../../app/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

import * as Jwt from '../../oauth2Server/jwtconf'

const testServer = appServer.app.listen(5000)

describe('Récupération de la liste des banquiers',function(){
  it('Doit retourner 200 et la liste des banquiers',function(done){
    let access_token = Jwt.encode({
      id:374,//idUser,
      exp: Jwt.expiresIn(5)
    })

    Chai.request(testServer)
      .get('/gestion/banquiers')
      .set("client_id","541")
      .send({
        access_token:access_token
      }).end(function(err,res){
        res.should.have.status(200)
        console.log(res.body)

        done()
      })

  })
})