import * as Chai from 'chai'
import { appServer} from '../../app/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

import * as Jwt from '../../oauth2Server/jwtconf'
import { Compte } from '../../app/models/Compte';
import { Userdb } from '../../oauth2Server/models/User';
import { STATUT_COMPTE_ACTIF, STATUT_COMPTE_AVALIDER, STATUT_COMPTE_REJETE, STATUT_COMPTE_BLOQUE } from '../../app/models/StatutCompte';

const testServer = appServer.app.listen(5000)

const emailClient = 'tharwaclient152@gmail.com' //mdp:tharwa152

let numCompteCourant = 0
let numCompteEpargne = 0

let idUser = 6

//OK
/* describe('Vérification si email exist', function() {
  it("Doit renvoyer erreur si un user n'existe pas /users/:userId GET",
    function(done){
    Chai.request(testServer)
        .get('/users/ew_redjem@esi.dz')
        .set("client_id","152")
        .send({
        })
        .end(function(err,res){
          res.should.have.status(200)
          res.body.exist.should.equal('true')
          done()
        })    
  });

  it("Doit renvoyer 200 si un user n'existe pas /users/:userId GET",
    function(done){
      Chai.request(testServer)
        .get('/users/test2@esi.dz')
        .set("client_id","152")
        .send({
        })
        .end(function(err,res){
          res.should.have.status(200)
          res.body.exist.should.equal('false')
          done()
        })    
  });

}); */

describe('Récupération de la liste des comptes d\'un user',function(){
  it('Doit renvoyer 400 si le id user est erroné(n\'existe pas sur GET /users/idUser/comptes',function(done){
    Chai.request(testServer)
    .get('/users/-1/comptes')
    .set("client_id","152")
    .send({
    })
    .end(function(err,res){
      err.should.have.status(400)
      console.log(res.body.msg_err)
      done()
    })    
  })

  it('Doit renvoyer 200 et retourner la liste des comptes si le id est correct GET /users/idUser/comptes',function(done){
    Chai.request(testServer)
    .get('/users/'+idUser+'/comptes')
    .set("client_id","152")
    .send({
    })
    .end(function(err,res){
      res.should.have.status(200)
      res.body.should.be.an('array')
      res.body.every((compte:any) => compte.should.have.property('num_compte'))
      res.body.every((compte:any) => compte.should.have.property('balance'))
      res.body.every((compte:any) => compte.should.have.property('date_creation'))
      res.body.every((compte:any) => compte.should.have.property('type_compte'))
      res.body.every((compte:any) => compte.should.have.property('code_monnaie'))
      res.body.every((compte:any) => compte.should.have.property('id_user'))
      res.body.every((compte:any) => compte.should.have.property('statut_actuel'))
      console.log(res.body)
      done()
    })    
  })
})

//OK
/* describe('Récupération des comptes selon un statut',function(){
  it('Doit retourner 401 si la requete provient de l\'app mobile',function(done){
    Chai.request(testServer)
      .get('/comptes?statut=1111')
      .set("client_id","152")
      .send({
      })
      .end(function(err,res){
        err.should.have.status(401)
        console.log(res.body.msg_err)
        done()
    })  
  });
  
  it('Doit renvoyer 400 si le statut est erroné',function(done){
    Chai.request(testServer)
      .get('/comptes?statut=1111')
      .set("client_id","541")
      .send({
      })
      .end(function(err,res){
        err.should.have.status(400)
        console.log(res.body.msg_err)
        done()
    })  
  });

  it('Doit retourner la liste des comptes à valider si statut = 1',function(done){
    Chai.request(testServer)
      .get('/comptes?statut=1')
      .set("client_id","541")
      .send({
      })
      .end(function(err,res){
        res.should.have.status(200)
        console.log(res.body)
        done()
    })  
  });

}); */

//OK
/* describe('Modification du statut d\'un compte',function(){
  before(function() {
    Userdb.findOne({
      where:{
        email:emailClient
      },attributes:['id']
    }).then((result:any)=>{
      if(result) {
        Compte.findOne({
          where:{
            id_user : result.id,
            type_compte:1
          }
        }).then((courant:any)=>{
          if(courant) {
            numCompteCourant = courant.num_compte
            console.log(numCompteCourant)
            courant.statut_actuel = 1
            courant.save()
          }
        })

        Compte.findOne({
          where:{
            id_user : result.id,
            type_compte:2
          }
        }).then((epargne:any)=>{
          if(epargne) {
            numCompteEpargne = epargne.num_compte
            epargne.statut_actuel = 1
            epargne.save()
          }
        })
      }
    });
  });

  it('Doit retourner 400 si la requete provient d\'un client mobile',function(done){
    Chai.request(testServer)
      .put('/comptes/'+numCompteCourant)
      .set("client_id","152")
      .send({
      })
      .end(function(err,res){
        err.should.have.status(401)
        console.log(res.body.msg_err)
        done()
    })  
  });

  it('Doit retourner 400 si le statut est erroné',function(done){
    Chai.request(testServer)
      .put('/comptes/'+numCompteCourant)
      .set("client_id","541")
      .send({
        statut:'111'
      })
      .end(function(err,res){
        err.should.have.status(400)
        console.log(res.body.msg_err)
        done()
    })  
  });

  it('Doit retourner 400 si le nouveau statut est "à valider/1"',function(done){
    Chai.request(testServer)
      .put('/comptes/'+numCompteCourant)
      .set("client_id","541")
      .send({
        statut:STATUT_COMPTE_AVALIDER
      })
      .end(function(err,res){
        err.should.have.status(400)
        console.log(res.body.msg_err)
        done()
    })  
  });

  it('Doit retourner 400 si le statut ne diffère pas du statut actuel du compte',function(done){
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      if(courant) {
        courant.statut_actuel = STATUT_COMPTE_ACTIF
        courant.save()

        Chai.request(testServer)
          .put('/comptes/'+numCompteCourant)
          .set("client_id","541")
          .send({
            statut:STATUT_COMPTE_ACTIF
          })
          .end(function(err,res){
            err.should.have.status(400)
            console.log(res.body.msg_err)
            done()
        })  
      }
    })
    
  });

  it('Doit retourner 400 si le compte à modifier a le statut rejeté',function(done){
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      if(courant) {
        courant.statut_actuel = STATUT_COMPTE_REJETE
        courant.save()

        Chai.request(testServer)
          .put('/comptes/'+numCompteCourant)
          .set("client_id","541")
          .send({
            statut:STATUT_COMPTE_ACTIF
          })
          .end(function(err,res){
            err.should.have.status(400)
            console.log(res.body.msg_err)
            done()
        })  
      }
    })
    
  });

  it('Doit retourner 400 si le compte à bloquer est non encore validé',function(done){
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      if(courant) {
        courant.statut_actuel = STATUT_COMPTE_AVALIDER
        courant.save()

        Chai.request(testServer)
          .put('/comptes/'+numCompteCourant)
          .set("client_id","541")
          .send({
            statut:STATUT_COMPTE_BLOQUE
          })
          .end(function(err,res){
            err.should.have.status(400)
            console.log(res.body.msg_err)
            done()
        })  
      }
    })
    
  });

  it('Doit retourner 400 si on veut rejeter un compte bloqué ',function(done){
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      if(courant) {
        courant.statut_actuel = STATUT_COMPTE_BLOQUE
        courant.save()

        Chai.request(testServer)
          .put('/comptes/'+numCompteCourant)
          .set("client_id","541")
          .send({
            statut:STATUT_COMPTE_REJETE
          })
          .end(function(err,res){
            err.should.have.status(400)
            console.log(res.body.msg_err)
            done()
        })  
      }
    })
    
  });

  it('Doit retourner 400 si le compte est à rejeter sans motif fourni',function(done){
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      if(courant) {
        courant.statut_actuel = STATUT_COMPTE_AVALIDER
        courant.save()

        Chai.request(testServer)
          .put('/comptes/'+numCompteCourant)
          .set("client_id","541")
          .send({
            statut:STATUT_COMPTE_REJETE
          })
          .end(function(err,res){
            err.should.have.status(400)
            console.log(res.body.msg_err)
            done()
        })  
      }
    })
    
  });

  it('Doit retourner 400 si le compte est à bloquer sans motif fourni',function(done){
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      if(courant) {
        courant.statut_actuel = STATUT_COMPTE_ACTIF
        courant.save()

        Chai.request(testServer)
          .put('/comptes/'+numCompteCourant)
          .set("client_id","541")
          .send({
            statut:STATUT_COMPTE_BLOQUE
          })
          .end(function(err,res){
            err.should.have.status(400)
            console.log(res.body.msg_err)
            done()
        })  
      }
    })
    
  });

  it('Doit retourner 400 si le compte est à débloquer sans motif fourni',function(done){
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      if(courant) {
        courant.statut_actuel = STATUT_COMPTE_BLOQUE
        courant.save()

        Chai.request(testServer)
          .put('/comptes/'+numCompteCourant)
          .set("client_id","541")
          .send({
            statut:STATUT_COMPTE_ACTIF
          })
          .end(function(err,res){
            err.should.have.status(400)
            console.log(res.body.msg_err)
            done()
        })  
      }
    })
    
  });

  it('Doit retourner 200 si la validation d\'un compte courant est successful',function(done){
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      courant.statut_actuel = 1;
      courant.save()

      this.timeout(10000);//Set le timeout à 10_000 ms
      Chai.request(testServer)
        .put('/comptes/'+numCompteCourant)
        .set("client_id","541")
        .send({
          statut:STATUT_COMPTE_ACTIF
        })
        .end(function(err,res){
          res.should.have.status(200)
          console.log(res.body)
          done()
      })  
    });
  });

  it('Doit retourner 200 si la validation d\'un compte épargne est successful',function(done){
    this.timeout(10000);//Set le timeout à 10_000 ms
    Compte.findOne({
      where:{
        num_compte:numCompteEpargne
      }
    }).then((epargne:any)=>{
      epargne.statut_actuel = 1;
      epargne.save()
      Chai.request(testServer)
        .put('/comptes/'+numCompteEpargne)
        .set("client_id","541")
        .send({
          statut:STATUT_COMPTE_ACTIF
        })
        .end(function(err,res){
          res.should.have.status(200)
          console.log(res.body)
          done()
      })  
    });
  });

  it('Doit retourner 200 si le rejet d\'un compte courant est successful',function(done){
    this.timeout(10000);//Set le timeout à 10_000 ms
    Compte.findOne({
      where:{
        num_compte:numCompteCourant
      }
    }).then((courant:any)=>{
      courant.statut_actuel = STATUT_COMPTE_AVALIDER;
      courant.save()

      this.timeout(10000);//Set le timeout à 10_000 ms
      Chai.request(testServer)
        .put('/comptes/'+numCompteCourant)
        .set("client_id","541")
        .send({
          statut:STATUT_COMPTE_REJETE,
          motif:"Informations non fiables"
        })
        .end(function(err,res){
          res.should.have.status(200)
          console.log(res.body)
          done()
      })  
    });
  });

  //OK
  it('Doit retourner 200 si le rejet d\'un compte épargne est successful',function(done){
    this.timeout(10000);//Set le timeout à 10_000 ms
    Compte.findOne({
      where:{
        num_compte:numCompteEpargne
      }
    }).then((epargne:any)=>{
      epargne.statut_actuel = STATUT_COMPTE_AVALIDER;
      epargne.save()
      Chai.request(testServer)
        .put('/comptes/'+numCompteEpargne)
        .set("client_id","541")
        .send({
          statut:STATUT_COMPTE_REJETE,
          motif:"Informations non fiables"
        })
        .end(function(err,res){
          res.should.have.status(200)
          console.log(res.body)
          done()
      })  
    });
  });

  it('Doit retourner 200 si le blocage d\'un compte courant est successful');

  it('Doit retourner 200 si le blocage d\'un compte épargne est successful');

  it('Doit retourner 200 si le déblocage d\'un compte courant est successful');

  it('Doit retourner 200 si le déblocage d\'un compte épargne est successful');
  
}) */