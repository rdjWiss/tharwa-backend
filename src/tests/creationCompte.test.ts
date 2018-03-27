import * as Chai from 'chai'
import { appServer} from '../app/index'
var chaiHttp=require('chai-http');
var should= Chai.should()
Chai.use(chaiHttp);

import {Userdb} from '../oauth2Server/models/User'
import {Compte} from '../app/models/Compte'
import { AvoirStatut } from '../app/models/AvoirStatut';

const testServer = appServer.app.listen(5000)

describe('Création d\'un compte user', function() {
  /* beforeEach(function(done){
    Userdb.destroy({
      where:{
        email:"test2@esi.dz"
      }
      }).then(function (deleted:any) {
        if(deleted === 1){
          console.log(deleted)
          Compte.destroy({
            where:{
              id_user:deleted.id
            }
          }).then(function(deleted2:any){
            if(deleted2 != 0 ){
              console.log(deleted2)
              AvoirStatut.destroy({
                where:{
                  num_compte: deleted2.num_compte
                }
              })
            }
          }).catch(function (error:any){
            console.log("Erreur destroy userdb")
        });          
        }
    }).catch(function (error:any){
        console.log("Erreur destroy userdb")
    });
    done();
  });  */ 

  it("Doit retourner erreur si l'email/user existe",
  function(done){
    Chai.request(testServer)
      .post('/users')
      .set("client_id","152")
      .send({
        email: "ew_redjem@esi.dz",
        passsword: "abc123"
      })
      .end(function(err,res){
        err.should.have.status(401)
        done()
      })    
  });

  it("Doit retourner 200 si le user le compte user est crée",function(done){
    //Supprimer le user
    
    Chai.request(testServer)
      .post('/users')
      .set("client_id","152")
      .send({
        email: 'test2@esi.dz',
        passsword: 'abc123',

        nom : "Test2",
        prenom : "TTTT",
        adress: "Oued Smar",
        tel: "213659125992",
        photo: "assets/images/image2.jpg",
        fonction: "B"
      })
      .end(function(err,res){
        err.should.have.status(200)
        done()
      })    

  });

  it("Doit retourner 200 si le user le compte user et bancaire sont crées",function(done){
    //Supprimer le user
    /* Userdb.destroy({
      where:{
        email:"test3@esi.dz"
      }
      }).then( (deleted:any) =>{
        if(deleted){
        Compte.destroy({
          where:{
            id_user:deleted.id
          }
        }).then( (deleted2:any) => {
          if(deleted2){
            AvoirStatut.destroy({
              where:{
                num_compte: deleted2.num_compte
              }
            })
          }
        })  
        }
      }) */

    
    Chai.request(testServer)
      .post('/users')
      .set("client_id","152")
      .send({
        email: 'test3@esi.dz',
        passsword: 'abc123',

        nom : "Test3",
        prenom : "TTTT",
        adress: "Oued Smar",
        tel: "213659125992",
        photo: "assets/images/image.jpg",
        fonction: "C"
      })
      .end(function(err,res){
        err.should.have.status(200)
        done()
      })    

  });
});