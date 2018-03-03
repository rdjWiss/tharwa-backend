import * as Chai from 'chai'
import {test} from '../oauth2Server/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

describe('Authentification', function() {
  it("doit interdire les application on autorisé  a http://localhost:4000/ ALL",function(done){
    Chai.request(test)
        .post('/login')
        .send({email: 'scott@stackabuse.com', passsword: 'abc123'})
        .end(function(err,res){
          err.should.have.status(401)
          done()
        })    
  });
  it('doit envoyer un code de vérification par mail ou sms http://localhost:4000/login POST',function(done){
    Chai.request(test)
        .post('/token')
        .set("client_id","152")
        .set("client_secret","Test")
        .send({
            "email":"ed_dahmane@esi.dz",
            "password":"Dahmane"
        })
        .end(function(err,res){
            res.should.have.status(200)
            res.body.status.should.equal(202)
        //    res.body.shoud.equal("Go validate your token")
            done();
        })
  });
  it('doit vérifier le code introduit par le user a http://localhost/verifier POST',function(done){
    Chai.request(test)
        .post('/verifier')
        .set("client_id","152")
        .set("client_secret","Test")
        .send({
            "user":"5",
            "token":"18839798"
        })
        .end(function(err,res){
            res.should.have.status(200)
            
            done()
        })
  });
  it("doit renvoyer une erreur si le code est invalide   ",function(done){
    Chai.request(test)
    .post('/verifier')
    .set("client_id","152")
    .set("client_secret","Test")
    .send({
        "user":"5",
        "token":"4454545"
    })
    .end(function(err,res){

        err.should.have.status(401)
    
        done();
    })
    });

  it("doit envoyer l'acces token et le refresh token si le code est valide  ",function(done){
    Chai.request(test)
    .post('/verifier')
    .set("client_id","152")
    .set("client_secret","Test")
    .send({
        "user":"5",
        "token":"18839798"
    })
    .end(function(err,res){

        res.should.have.status(200)
        res.body.should.have.property("access_token")
        res.body.should.have.property("refresh_token")
        res.body.should.have.property("expires_in")
        res.body.should.have.property("scope")
        res.body.should.have.property("user")
        res.body.token_type.should.equal("bearer")
        done();
    })
    });
})

describe('Input validation ', function() {

    it("doit retourner une erreur si les champs email,password sont vides  http://localhost:4000/login POST",function(done){
      Chai.request(test)
          .post('/login')
          .send({email: '', passsword: ''})
          .end(function(err,res){
            err.should.have.status(401)
            done()
          })    
    });


    it("doit retourner une erreur de type invaide_request si les champs user,token sont vides  http://localhost:4000/login POST",function(done){
      Chai.request(test)
          .post('/verifier')
          .send({})
          .end(function(err,res){
            err.should.have.status(401)
            done()
          })    
    });

    
    it("doit retourner une erreur de type invaide_request si les champs user,token sont vides  http://localhost:4000/login POST",function(done){
      Chai.request(test)
          .post('/verifier')
          .send({})
          .end(function(err,res){
            err.should.have.status(401)
            done()
          })    
    });
});
