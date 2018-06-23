import * as Chai from 'chai'
import { appServer} from '../../app/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

import * as Jwt from '../../oauth2Server/jwtconf'

const testServer = appServer.app.listen(5000)

let codeBanque = 'BFF'
let email ='bff@gmail.com'

//OK
/* describe('Récupération de la liste des banquiers',function(){
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
        res.body.should.be.an('array')
        res.body.forEach((banquier:any) => {
          banquier.should.have.property('nom')
          banquier.should.have.property('prenom')
          banquier.should.have.property('email')
          banquier.should.have.property('telephone')
          banquier.should.have.property('photo')
        });
        console.log(res.body)

        done()
      })

  })
}) */

//OK
/* describe('Gestion des banques',function(){
  it('Doit retourner 400 si un des champs manque (code banque, nom, email, ...)',function(done){
    Chai.request(testServer)
    .post('/gestion/banques/')
    .set("client_id","541")
    .send({
      // access_token:access_token,
      nom:'tharwa',
      raison_sociale:'kk',
      email:'hs@gd.ssq',
      adresse:'fsd'
    })
    .end(function(err,res){
      res.should.have.status(400)
      res.body.should.have.property('code_err').equals('B01')
      // console.log(res.body)
      done()
    })  
  })

  it('Doit retourner 400 si le code de la banque existe',function(done){
    Chai.request(testServer)
    .post('/gestion/banques/')
    .set("client_id","541")
    .send({
      // access_token:access_token,
      code_banque:'THW',
      nom:'tharwa',
      raison_sociale:'kk',
      email:'hs@gd.ssq',
      adresse:'fsd'
    })
    .end(function(err,res){
      res.should.have.status(400)
      res.body.should.have.property('code_err').equals('B03')
      // console.log(res.body)
      done()
    })  
  })
  
  it('Doit retourner 200 si les données de la banque sont fournies pour création',function(done){
    Chai.request(testServer)
    .post('/gestion/banques/')
    .set("client_id","541")
    .send({
      // access_token:access_token,
      code_banque:codeBanque,
      nom:codeBanque,
      raison_sociale:codeBanque,
      email:email,
      adresse:codeBanque
    })
    .end(function(err,res){
      res.should.have.status(200)
      res.body.should.have.property('code_banque')
      res.body.should.have.property('nom')
      res.body.should.have.property('raison_sociale')
      res.body.should.have.property('email')
      res.body.should.have.property('adresse')
      // console.log(res.body)
      done()
    })  
  })

  it('Doit retourner 200 et retourner la liste des banques',function(done){
    Chai.request(testServer)
    .get('/gestion/banques/')
    .set("client_id","541")
    .send({
      // access_token:access_token,
    })
    .end(function(err,res){
      res.should.have.status(200)
      res.body.should.be.an('array')
      res.body.forEach((compte:any) => {
        compte.should.have.property('code_banque')
        compte.should.have.property('nom')
        compte.should.have.property('raison_sociale')
        compte.should.have.property('email')
        compte.should.have.property('adresse')
      });
      // console.log(res.body)
      done()
    })  
  })

  it('Doit retourner 400 si le code de la banque n\'existe pas (modif/supp)',function(done){
    let codeBanque = 'AAA'

    Chai.request(testServer)
    .del('/gestion/banques/'+codeBanque) //put
    .set("client_id","541")
    .send({
      // access_token:access_token,
    })
    .end(function(err,res){
      res.should.have.status(400)
      res.body.should.have.property('code_err').equals('B05')
      done()
    })  
  })

  it('Doit retourner 200 si la modification de la banque s\'est effectuée avec succès ',function(done){
    let raisonSociale = 'New raison'
    let adresse = 'New adresse'
    let email = 'New@email.com'
    let nom = 'New nom'
    
    Chai.request(testServer)
    .put('/gestion/banques/'+codeBanque)
    .set("client_id","541")
    .send({
      // access_token:access_token,
      nom:nom,
      raison_sociale:raisonSociale,
      email:email,
      adresse:adresse
    })
    .end(function(err,res){
      res.should.have.status(200)
      res.body.should.have.property('code_banque').equals(codeBanque)
      res.body.should.have.property('nom').equals(nom)
      res.body.should.have.property('raison_sociale').equals(raisonSociale)
      res.body.should.have.property('email').equals(email)
      res.body.should.have.property('adresse').equals(adresse)
      // console.log(res.body)
      done()
    })  
  })

  it('Doit retourner 200 si la suppression de la banque a été successful',function(done){
    Chai.request(testServer)
    .del('/gestion/banques/'+codeBanque)
    .set("client_id","541")
    .send({
      // access_token:access_token,
    })
    .end(function(err,res){
      res.should.have.status(200)

      done()
    })  
  })
}) */