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

//Seront modifiés dans les tests
let numCompteCourant = 'THW000132DZD'
let numCompteEpargne = 'THW000134DZD'

let idUser = 6
let timePin = 60 //min

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

//OK
/* describe('Récupération de la liste des comptes d\'un user',function(){
  it('Doit renvoyer 400 si le id user est erroné(n\'existe pas sur GET /users/idUser/comptes',function(done){
    Chai.request(testServer)
    .get('/users/-1/comptes')
    .set("client_id","152")
    .send({
    })
    .end(function(err,res){
      err.should.have.status(400)
      res.body.should.have.property('code_err').equals('U03')
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
      res.body.should.have.property('comptes')
      res.body.comptes.should.be.an('array')
      res.body.comptes.every((compte:any) =>{
        compte.should.have.property('num_compte')
        compte.should.have.property('balance')
        compte.should.have.property('type_compte')
        compte.should.have.property('code_monnaie')
        compte.should.have.property('id_user')
        compte.should.have.property('statut_actuel')
      })
      // console.log(res.body)
      done()
    })    
  })
}) */

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
        res.body.should.have.property('code_err').equals('A02')
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
        res.body.should.have.property('code_err').equals('C06')
        console.log(res.body.msg_err)
        done()
    })  
  });

  it('Doit retourner la liste des comptes à valider ',function(done){
    Chai.request(testServer)
      .get('/comptes?statut='+STATUT_COMPTE_AVALIDER)
      .set("client_id","541")
      .send({
      })
      .end(function(err,res){
        res.should.have.status(200)
        res.body.should.be.an('array')
        res.body.every((element:any) =>{
          element.should.have.property('compte')
          element.compte.should.have.property('num_compte')
          element.compte.should.have.property('type_compte')
          element.compte.should.have.property('code_monnaie')
          element.compte.should.have.property('id_user')
          element.compte.should.have.property('statut_actuel').equals(STATUT_COMPTE_AVALIDER)
          element.should.have.property('user')
          element.user.should.have.property('id')
          element.user.should.have.property('prenom')
          element.user.should.have.property('photo')
          element.user.should.have.property('email')
          element.user.should.have.property('fonctionId')
          element.user.should.have.property('adresse')
          element.user.should.have.property('telephone')
        })
        // console.log(res.body)
        done()
    })  
  });

  it('Doit retourner la liste des comptes validés',function(done){
    Chai.request(testServer)
      .get('/comptes?statut='+STATUT_COMPTE_ACTIF)
      .set("client_id","541")
      .send({
      })
      .end(function(err,res){
        res.should.have.status(200)
        res.body.should.be.an('array')
        res.body.every((element:any) =>{
          element.should.have.property('compte')
          element.compte.should.have.property('num_compte')
          element.compte.should.have.property('type_compte')
          element.compte.should.have.property('code_monnaie')
          element.compte.should.have.property('id_user')
          element.compte.should.have.property('statut_actuel').equals(STATUT_COMPTE_ACTIF)
          element.should.have.property('user')
          element.user.should.have.property('id')
          element.user.should.have.property('prenom')
          element.user.should.have.property('photo')
          element.user.should.have.property('email')
          element.user.should.have.property('fonctionId')
          element.user.should.have.property('adresse')
          element.user.should.have.property('telephone')
        })

        // console.log(res.body)
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
            console.log("Compte courant",numCompteCourant)
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

  it('Doit retourner 401 si la requete provient d\'un client mobile',function(done){
    Chai.request(testServer)
      .put('/comptes/'+numCompteCourant)
      .set("client_id","152")
      .send({
        statut:'566'
      })
      .end(function(err,res){
        err.should.have.status(401)
        res.body.should.have.property('code_err').equals('A02')
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
        res.body.should.have.property('code_err').equals('C06')
        console.log(res.body.msg_err)
        done()
    })  
  });

  it('Doit retourner 400 si le nouveau statut est "à valider/1/"',function(done){
    console.log('jkfs')
    Chai.request(testServer)
      .put('/comptes/'+numCompteCourant)
      .set("client_id","541")
      .send({
        statut:STATUT_COMPTE_AVALIDER
      })
      .end(function(err,res){
        err.should.have.status(400)
        res.body.should.have.property('code_err').equals('C07')
        console.log("err",res.body)
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
            res.body.should.have.property('code_err').equals('C07')
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
            res.body.should.have.property('code_err').equals('C07')
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
            res.body.should.have.property('code_err').equals('C07')
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
            res.body.should.have.property('code_err').equals('C07')
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
            res.body.should.have.property('code_err').equals('C08')
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
            res.body.should.have.property('code_err').equals('C08')
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

//OK
/* describe('Récupérer l\'historique d\'un compte',function(){
  it('Doit retourner 200 et l\'historique des comptes du user',function(done){
    this.timeout(5000);

    let access_token = Jwt.encode({
      id:371,//idUser,
      exp: Jwt.expiresIn(5)//5mins
    })

    let code_pin= Jwt.encode({
      code:'1235',
      exp: Jwt.expiresIn(timePin)
    })

    Chai.request(testServer)
          .get('/historique')
          .set("client_id","152")
          .set("access_token",access_token)
          .set("code_pin",code_pin)
          .send({
          })
          .end(function(err,res){
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.forEach((element:any) => {
              element.should.have.property("type")
              if(['VEC','VE','VR'].indexOf(element.type)!=-1){
                element.should.have.property("code_virement")
                element.should.have.property("montant")
                element.should.have.property("motif")
                element.should.have.property("date_virement")
                element.should.have.property("emmetteur")
                element.should.have.property("recepteur")
                element.should.have.property("statut_virement")
                element.should.have.property("justificatif")
              }else if (['CV','CG'].indexOf(element.type)!= -1){
                element.should.have.property("id_commission")
                element.should.have.property("montant_commission")
                element.should.have.property("date_commission")
              }
              // console.log(element.type,element.date)
            });
            console.log(res.body)
            done()
        })  

     })
}) */

//OK
/* describe('Récupérer les comptes pour blocage',function(){
  it('Doit retourner 200 et les comptes respectant les critères',function(done){
    let access_token = Jwt.encode({
      id:374,//idUser,
      exp: Jwt.expiresIn(5)
    })

    let nom='dj'
    let prenom='m'
    let email='redj'

    Chai.request(testServer)
      .get('/comptes/rech/?nom='+nom+'&prenom='+prenom+'&email='+email)
      .set("client_id","541")
      .set("access_token",access_token)
      .send({
      })
      .end(function(err,res){
        res.should.have.status(200)
        res.body.should.be.an('array')
        res.body.forEach((compte:any) => {
          compte.should.have.property('num_compte')
          compte.should.have.property('date_creation')
          compte.should.have.property('statut_actuel')
          compte.should.have.property('type_compte')
          compte.should.have.property('code_monnaie')
          compte.should.have.property('id_user')
          compte.should.have.property('userdb')
          compte.userdb.should.have.property('nom')
          compte.userdb.should.have.property('prenom')
          compte.userdb.should.have.property('adresse')
          compte.userdb.should.have.property('telephone')
          compte.userdb.should.have.property('email')
          compte.userdb.should.have.property('photo')
        });
        console.log(res.body)
        done()
    })  

     
  })
}) */