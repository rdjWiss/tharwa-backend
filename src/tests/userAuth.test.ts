import * as Chai from 'chai'
import {authServer} from '../oauth2Server/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

const testServer = authServer.app.listen(5000)
var hash;
describe('Authentification', function() {
    
  it("doit interdire les application on autorisé  a https://tharwa:4000/ ALL",function(done){
    Chai.request(testServer)
        .post('/login')
        .send({email: 'scott@stackabuse.com', passsword: 'abc123'})
        .end(function(err,res){
          err.should.have.status(401)
          done()
        })    
  });
  it('doit envoyer un hash permettant de choisir la methode de reception de code (SMS/MAIL) https://tharwa:4000/login POST',function(done){
    Chai.request(testServer)
        .post('/login')
        .set("client_id","152")
        .set("client_secret","Test")
        .send({
            "email":"ed_dahmane@esi.dz",
            "password":"Dahmane"
        })
        .end(function(err,res){
            res.should.have.status(200)
            res.body.should.have.property("userId")
            hash=res.body.userId
        //    res.body.shoud.equal("Go validate your token")
            done();
        })
  });
  before(()=>{
      Chai.request(testServer)
      .post('/login')
      .set("client_id","152")
      .set("client_secret","Test")
      .send({
          "email":"ed_dahmane@esi.dz",
          "password":"Dahmane"
      })
      .end(function(err,res){
          console.log("Test")
          hash = res.body.userId
      })  
  })
  it('doit envoyer Le code de validation au user pas SMS ou par Mail  https://tharwa:4000/choix POST',function(done){
    console.log(hash)
    Chai.request(testServer)
        .post('/choisir')
        .set("client_id","152")
        .set("client_secret","Test")
        .send({
            "user":hash,
            "choix":"Mail"
        })
        .end(function(err,res){
            res.should.have.status(200)
            
        //    res.body.shoud.equal("Go validate your token")
            done();
        })
  });
  it('doit vérifier le code introduit par le user a https://tharwa/verifier POST',function(done){
    Chai.request(testServer)
        .post('/verifier')
        .set("client_id","152")
        .set("client_secret","Test")
        .send({
            "user":hash,
            "token":"70563821"
        })
        .end(function(err,res){
            res.should.have.status(200)
            res.should.have.property
            done()
        })
  });
  it("doit renvoyer une erreur si le code est invalide   ",function(done){
    Chai.request(testServer)
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
    Chai.request(testServer)
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
    });*/
})

/*describe('Input validation ', function() {

    it("doit retourner une erreur si les champs email,password sont vides  http://tharwa:4000/login POST",function(done){
      Chai.request(testServer)
          .post('/login')
          .send({email: '', passsword: ''})
          .end(function(err,res){
            err.should.have.status(401)
            done()
          })    
    });


    it("doit retourner une erreur de type invaide_request si les champs user,token sont vides  http://tharwa:4000/login POST",function(done){
      Chai.request(testServer)
          .post('/verifier')
          .send({})
          .end(function(err,res){
            err.should.have.status(401)
            done()
          })    
    });

    
    it("doit retourner une erreur de type invaide_request si les champs user,token sont vides  http://tharwa:4000/login POST",function(done){
      Chai.request(testServer)
          .post('/verifier')
          .send({})
          .end(function(err,res){
            err.should.have.status(401)
            done()
          })    
    });
});*/

