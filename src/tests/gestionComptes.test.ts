import * as Chai from 'chai'
import { appServer} from '../app/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

import * as Jwt from '../oauth2Server/jwtconf'

const testServer = appServer.app.listen(5000)

let tokens = Jwt.genToken({nom:"Redjme",prenom:"Wissem"},"C","1236") 

describe('Gestion des comptes', function() {
  it("Doit renvoyer erreur si un user n'existe pas /users/:userId GET",
  function(done){
    Chai.request(testServer)
        .get('/users/ew_redjem@esi.dz')
        .set("client_id","152")
        .send({
          /* verification_token: tokens.verification_token,
          access_token: tokens.access_token ,
          refresh_token: tokens.refresh_token , */
        })
        .end(function(err,res){
          res.should.have.status(200)
          done()
        })    
  });

  it("Doit renvoyer OK si un user existe /users/:userId GET",
  function(done){
    Chai.request(testServer)
        .get('/users/test2@esi.dz')
        .set("client_id","152")
        .send({
          /* verification_token: tokens.verification_token,
          access_token: tokens.access_token ,
          refresh_token: tokens.refresh_token , */
        })
        .end(function(err,res){
          err.should.have.status(404)
          done()
        })    
  });
});