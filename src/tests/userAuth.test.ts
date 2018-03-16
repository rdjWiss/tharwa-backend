import * as Chai from 'chai'
import {authServer} from '../oauth2Server/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

import * as Jwt from '../oauth2Server/jwtconf'
import { VerificationToken } from '../oauth2Server/models/VerificationToken';

const testServer = authServer.app.listen(5000)
var hash:any, verificationToken:any;
describe('Authentification', function() {
    
  it("Doit interdire les applications non autorisées à https://tharwa:4000/ ALL",function(done){
    Chai.request(testServer)
        .post('/login')
        .send({email: 'scott@stackabuse.com', passsword: 'abc123'})
        .end(function(err,res){
          err.should.have.status(401)
          done()
        })    
  });
  //--------------------------------------------------------------
  it('Doit envoyer un hash permettant de choisir la methode de reception du code (SMS/MAIL) https://tharwa:4000/login POST',function(done){
    Chai.request(testServer)
        .post('/login')
        .set("client_id","152")
        .send({
            "email":"ew_redjem@esi.dz",
            "password":"Test"
        })
        .end(function(err,res){
          res.should.have.status(200)
          res.body.should.have.property("userId")
          hash=res.body.userId
          done();
        })
    });
    //------------------------------------------------------------
    before(()=>{
        Chai.request(testServer)
        .post('/login')
        .set("client_id","152")
        .send({
            "email":"ew_redjem@esi.dz",
            "password":"Test"
        })
        .end(function(err,res){
            hash = res.body.userId
            let v=Jwt.decode(hash);
            verificationToken=v.token    
        })  
    });
    it('doit envoyer Le code de validation au user pas SMS ou par Mail  https://tharwa:4000/choisir POST',function(done){
        this.timeout(10000);//Set le timeout à 10_000 ms
        Chai.request(testServer)
        .post('/choisir')
        .set("client_id","152")
        .send({
            "user":hash,
            "choix":"MAIL"
        })
        .end(function(err,res){
          res.should.have.status(200)

          
        let v=Jwt.decode(hash);
        VerificationToken.findOne({
            where:{
                userdbId: v.id
            }
        }).then((result:any) =>{
            console.log(result)
            verificationToken=result.token
        })

          done();
        })
    });
  //------------------------------------------------
  it("Doit renvoyer une erreur si le code est invalide   ",function(done){
    Chai.request(testServer)
    .post('/verifier')
    .set("client_id","152")
    .send({
        "user":hash,
        "token":"4454"
    })
    .end(function(err,res){
        err.should.have.status(401)
        done();
    })
    });
 //------------------------------------------------
  it("Doit envoyer l'access token et le refresh token si le code est valide  ",function(done){
    Chai.request(testServer)
    .post('/verifier')
    .set("client_id","152")
    .send({
        "user":hash,
        "token":verificationToken+""
    })
    .end(function(err,res){

        res.should.have.status(200)
        res.body.should.have.property("access_token")
        res.body.should.have.property("refresh_token")
        res.body.should.have.property("expires_in")
        /* res.body.should.have.property("scope") */
        res.body.should.have.property("user")
        res.body.token_type.should.equal("bearer")
        //console.log(res)
        done();
    })
    });
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