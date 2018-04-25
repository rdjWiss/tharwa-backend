import * as Chai from 'chai'
import {appServer} from '../../app/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

var jwtsimple =require('jwt-simple');
import * as Jwt from '../../oauth2Server/jwtconf'
import { token } from 'morgan';

const testServer = appServer.app.listen(5000);
let tokens = Jwt.genToken({nom:"Redjem",prenom:"Wissem"},"C","1236") 

describe('Verification des tokens: code, access et refresh', function() {
  it("Doit vérifier si les tokens ont expiré ou non",
  function(done){
    Chai.request(testServer)
        .get('/users/1')
        .set("client_id","152")
        .send({
          verification_token: tokens.verification_token,
          access_token: tokens.access_token ,
          refresh_token: tokens.refresh_token ,
        })
        .end(function(err,res){
          res.should.have.status(200)
          done()
        })    
  });
});