import * as Chai from 'chai'
import {authServer} from '../../oauth2Server/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

import * as Jwt from '../../oauth2Server/jwtconf'
import { VerificationToken } from '../../oauth2Server/models/VerificationToken';

const testServer = authServer.app.listen(5000)
var hash:any, verificationToken:any;
describe('Authentification', function() {
  /* Test 1 */
  it("Doit interdire les applications non autorisées à https://tharwa:4000/ ALL",function(done){
    this.timeout(10000)
    Chai.request(testServer)
        .post('/login')
        .send({email: 'scott@stackabuse.com', passsword: 'abc123'})
        .end(function(err,res){
          err.should.have.status(401)
          res.body.should.have.property('code_err').equals('A01')
          console.log(res.body.msg_err)
          done()
        })    
  });

  it('Doit envoyer un hash permettant de choisir la methode de reception du code (SMS/MAIL) https://tharwa:4000/login POST',function(done){
    this.timeout(10000)
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
            // console.log(result)
            verificationToken=result.token
            })

            done();
        })
    });

  it("Doit renvoyer une erreur si le code est invalide   ",function(done){
    this.timeout(10000)
    Chai.request(testServer)
    .post('/verifier')
    .set("client_id","152")
    .send({
        "user":hash,
        "token":"4454"
    })
    .end(function(err,res){
        err.should.have.status(401)
        res.body.should.have.property('code_err').equals('A11')
        done();
    })
    });

 it("Doit envoyer l'access token et le refresh token si le code est valide  ",function(done){
    this.timeout(10000)
    Chai.request(testServer)
    .post('/verifier')
    .set("client_id","152")
    .send({
        "user":hash,
        "token":verificationToken+""
    })
    .end(function(err,res){

        res.should.have.status(200)
        res.body.should.have.property("code_pin")
        res.body.should.have.property("access_token")
        res.body.should.have.property("refresh_token")
        res.body.should.have.property("expires_in")
        res.body.should.have.property("user")
        res.body.user.should.have.property('id')
        res.body.user.should.have.property('nom')
        res.body.user.should.have.property('prenom')
        res.body.user.should.have.property('photo')
        res.body.user.should.have.property('email')
        res.body.user.should.have.property('fonctionId')
        let fonction = res.body.user.fonctionId
        if(fonction == 'C' || fonction == 'E'){
            res.body.should.have.property('comptes')
            res.body.comptes.should.be.an('array')
            res.body.comptes.every((compte:any) => compte.should.have.property('num_compte'))
            res.body.comptes.every((compte:any) => compte.should.have.property('balance'))
            res.body.comptes.every((compte:any) => compte.should.have.property('date_creation'))
            res.body.comptes.every((compte:any) => compte.should.have.property('type_compte'))
            res.body.comptes.every((compte:any) => compte.should.have.property('code_monnaie'))
            res.body.comptes.every((compte:any) => compte.should.have.property('statut_actuel'))
        }
        res.body.token_type.should.equal("bearer")
        // console.log(res.body)
        done();
    })
    });


})
