import * as Chai from 'chai'
import {authServer} from '../../oauth2Server/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

var jwtsimple =require('jwt-simple');
import * as Jwt from '../../oauth2Server/jwtconf'
import { token } from 'morgan';

const testServer = authServer.app.listen(5000);
let tokens :any = null

let userId = 6
let timePin = 60 //min
let code_pin= ''
let access_token = ''
let refresh_token = ''
let hashChoix = ''

let code:any

//OK
describe('Verification des tokens: code, access et refresh', function() {
  before(function(){
    access_token = Jwt.encode({
      id:userId,
      exp: Jwt.expiresIn(-5)
    })

    code_pin= Jwt.encode({
      code:'1235',
      exp: Jwt.expiresIn(-timePin)
    })

    refresh_token = Jwt.encode({
      id:userId,
      exp: Jwt.expiresIn(-3*60)
    })
  })

  it("Doit retourner 401 si l'access token a expiré'",
    function(done){
      Chai.request(testServer)
        .post('/testtokens')
        .set("client_id","152")
        .set('access_token',access_token)
        .set('code_pin',code_pin)
        .send({
        })
        .end(function(err,res){
          err.should.have.status(401)
          res.body.should.have.property('code_err').equals('A16')
          console.log(res.body.msg_err)
          done()
        })    
  });

  it("Doit retourner 401 si refresh token a expiré (route refresh access token)",
    function(done){
    Chai.request(testServer)
      .post('/refreshaccess')
      .set("client_id","152")
      .set('refresh_token',refresh_token)
      .send({
      })
      .end(function(err,res){
        err.should.have.status(401)
        res.body.should.have.property('code_err').equals('A18')
        console.log(res.body.msg_err)
        done()
      })    
  });

  it("Doit retourner 200 et un nouveau access token si le refresh token n'a pas expiré",
    function(done){
    refresh_token = Jwt.encode({
      id:userId,
      exp: Jwt.expiresIn(+3*60)
    })

    Chai.request(testServer)
      .post('/refreshaccess')
      .set("client_id","152")
      .set('refresh_token',refresh_token)
      .send({
      })
      .end(function(err,res){
        res.should.have.status(200)
        res.body.should.have.property('access_token')
        console.log(Jwt.decode(res.body.access_token))

        // console.log(res.body)
        done()
      })    
  });

  it("Doit retourner 401 si le code pin token a expiré'",
    function(done){
      access_token = Jwt.encode({
        id:userId,
        exp: Jwt.expiresIn(5)
      })
  
      code_pin= Jwt.encode({
        code:'1235',
        exp: Jwt.expiresIn(-timePin)
      })

      Chai.request(testServer)
        .post('/testtokens')
        .set("client_id","152")
        .set('access_token',access_token)
        .set('code_pin',code_pin)
        .send({
        })
        .end(function(err,res){
          err.should.have.status(401)
          res.body.should.have.property('code_err').equals('A17')
          res.body.should.have.property('userId')
          hashChoix=res.body.userId
          // console.log(res.body)
          done()
        })    
  });

  it("Doit retourner 200 et envoyer le nouveau code pin au user",
    function(done){
    access_token = Jwt.encode({
      id:userId,
      exp: Jwt.expiresIn(+5)
    })
    Chai.request(testServer)
      //.post('/refreshpin/1')
      .post('/choisir')
      .set("client_id","152")
      .set('access_token',access_token)
      .send({
        user:hashChoix,
        choix:'MAIL'
      })
      .end(function(err,res){
        res.should.have.status(200)
        res.body.should.have.property('code')
        code = res.body.code
        console.log(res.body)
        done()
      })   
    
  });

  it("Doit retourner 200 si le code pin saisi par le client est correct  ",function(done){

    this.timeout(10000)
    Chai.request(testServer)
    .post('/refreshpin/2')
    .set("client_id","152")
    .set('access_token',access_token)
    .send({
        user:access_token,
        token:code+''
    })
    .end(function(err,res){
      console.log(res.body.code_err)
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
      // console.log(res.body.code_err)
      done();
    })
  });

});