import * as Chai from 'chai'
import { creerVirement, genererCodeVir } from "../../app/controllers/GestionVirements";

var should= Chai.should()

describe('Gestion des virements', function () {
   it('Doit créer un virement', function () {
    let code = "THW000002DZDTHW000004DZD201842316157"
    let montant = 500
    let src = 'THW000002DZD'
    let dest = 'THW000004DZD' 
    let vir = {
      code:code,
      montant:montant,
      motif:'Construction',
      dateNow:null,
      justif:null,
      src:src,
      dest:dest,
      statut:2,
      user: 6,
      type:1
    }
    creerVirement(vir,function(created:any){
      created.should.have.property("code_virement").equals(code)
      created.should.have.property("montant").equals(montant)
      created.should.have.property("emmetteur").equals(src)
      created.should.have.property("recepteur").equals(dest)
      console.log(created.dataValues)
    },(error:any)=>{
      console.log(error)
    });
      
  }); 
 
  it('Le code du virement doit correspondre à l\'expression régulière', function(){
    let numCompte = 'THW000002DZD'
    var dateNow = new Date();
    let code = genererCodeVir(dateNow,numCompte,numCompte)
    console.log(code)
    code.should.match(/[A-Z]{3}\d{6}[A-Z]{3}[A-Z]{3}\d{6}[A-Z]{3}\d{12}/)
  })
});

describe('Gestion des virements', function () {
  it('Le numéro du compte doit correspondre à l\'expression régulière', function(){
    let numCompte = 'THW000002DZD'
    numCompte.should.match(/[A-Z]{3}\d{6}[A-Z]{3}/)
  })
});