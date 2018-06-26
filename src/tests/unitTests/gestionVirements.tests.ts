import * as Chai from 'chai'
import { GestionVirements } from '../../app/controllers/GestionVirements';
import { STATUT_VIR_VALIDE, STATUT_VIR_AVALIDER, STATUT_VIR_REJETE } from '../../app/models/StatutVirement';
import { regexpCodeVir, VIR_INTERNE, VIR_EXTERNE } from '../../app/models/Virement';
import { STATUT_COMPTE_ACTIF } from '../../app/models/StatutCompte';
import { COMPTE_COURANT, COMPTE_DEVISE, COMPTE_EPARGNE } from '../../app/models/TypeCompte';

var should= Chai.should()

let userId = 6
let gestionVir =new GestionVirements()

describe('Gestion des virements', function () {
  
  it('Doit créer un enregistrement virement (valide)', function () {
     //Primary key
    let date = new Date()
    let src = 'THW000002DZD'
    let dest = 'THW000004DZD' 
    let code = GestionVirements.genererCodeVir(date,src,dest)
    let montant = 500
    let vir = {
      code:code,
      montant:montant,
      motif:'Construction',
      dateNow:null,
      justif:null,
      src:src,
      dest:dest,
      statut:STATUT_VIR_VALIDE,//STATUT_VIR_AVALIDER
      user: userId
    }
    GestionVirements.creerEnregVirement(vir,function(created:any){
      created.should.have.property("code_virement").equals(code)
      created.should.have.property("montant").equals(montant)
      created.should.have.property("emmetteur").equals(src)
      created.should.have.property("recepteur").equals(dest)
      created.should.have.property("statut_virement").equals(STATUT_VIR_VALIDE)
      // console.log(created.dataValues)
    },(error:any)=>{
      console.log(error)
    });
      
  })

  it('Le code du virement doit correspondre à l\'expression régulière', function(){
    let numCompte = 'THW000002DZD'
    var dateNow = new Date();
    let code = GestionVirements.genererCodeVir(dateNow,numCompte,numCompte)
    console.log(code)
    // code.should.match(/[A-Z]{3}\d{6}[A-Z]{3}[A-Z]{3}\d{6}[A-Z]{3}\d{12}/)
    code.should.match(regexpCodeVir)
  })

  it('Doit retourner true si le numéro de compte src == dest',function(){
      var numCompte = "THW00002DZ"
      var retour = GestionVirements.isSrcEqualDest(numCompte,numCompte)
      retour.should.equals(true)
  })

  it('Doit retourner true si le compte est actif',function(){
    var compte = {
      statut_actuel: STATUT_COMPTE_ACTIF
    }
    var retour = GestionVirements.isCompteActif(compte)
    retour.should.equals(true)
  })

  it('Doit retourner true si les comptes sont des comptes courants (Clients diff)',function(){
    var compte = {
      type_compte:COMPTE_COURANT
    }
    var retour = GestionVirements.isValidVirementEntreClientDiff(compte,compte)
    retour.should.equals(true)
  })

  it('Doit retourner false si l\'un des comptes n\'est pas courant (Clients diff)',function(){
    var compte = {
      type_compte:COMPTE_COURANT
    }
    var compte2 = {
      type_compte:COMPTE_DEVISE
    }
    var retour = GestionVirements.isValidVirementEntreClientDiff(compte,compte2)
    retour.should.equals(false)
  })

  it(`Doit retourner false si le virement n'est pas possible entre comptes
   du meme client (les deux comptes ne sont pas courant)`,function(){
    var compte = { type_compte:COMPTE_DEVISE}
    var compte2 = { type_compte:COMPTE_EPARGNE}
    var retour = GestionVirements.isValidVirementComptesDuMemeClient(compte, compte2)

    retour.should.equals(false)
  })


  it('Doit retourner true si le statut du virement est valide',function(){
     var statut = STATUT_VIR_AVALIDER //8
     GestionVirements.isValidStatutVir(statut,function(result:string){
        result.should.equals(true)
     },(error:any)=>{
        error.should.equals('Statut compte erroné')
     })
  }) 

  it(`Doit retourner true si le changement du statut d\'un virement est valide 
    (A VALIDER -> VALIDE)`,function(){
    var retour = GestionVirements.isValidChangementStatut(STATUT_VIR_AVALIDER,STATUT_VIR_VALIDE)
    retour.should.equals(true)

  }) 

  it(`Doit retourner true si le changement du statut d\'un virement est valide 
    (A VALIDER -> REJETE)`,function(){
    var retour = GestionVirements.isValidChangementStatut(STATUT_VIR_AVALIDER,STATUT_VIR_REJETE)
    retour.should.equals(true)
  }) 

  it('Doit retourner les infos des users du virement',function(){
    GestionVirements.getVirSrcDest({
      src:'THW000002DZD',
      dest:'THW000132DZD'
    },function(infos:any){
      // console.log(infos.emetteur.dataValues,infos.recepteur.dataValues)
      infos.should.have.property('emetteur')
      infos.emetteur.should.have.property('nom')
      infos.emetteur.should.have.property('prenom')
      infos.emetteur.should.have.property('photo')
      infos.emetteur.should.have.property('adresse')
      infos.emetteur.should.have.property('email')
      infos.should.have.property('recepteur')
      infos.recepteur.should.have.property('nom')
      infos.recepteur.should.have.property('prenom')
      infos.recepteur.should.have.property('photo')
      infos.recepteur.should.have.property('adresse')
      infos.recepteur.should.have.property('email')
    },(error:any)=>{

    })
  })


//TODO: fix type virement. function not found
  /* it('Doit retourner le type du virement: interne',function(){
    let retour = gestionVir.typeVirement('THW000002DZD','THW000004DZD',function(type:string){
      type.should.equals(VIR_INTERNE)
      // console.log(type)
    },(error:any)=>{
      console.log(error)
    })
  })

  it('Doit retourner le type du virement: externe et état émis',function(){
    let retour = GestionVirements.typeVirement('THW000002DZD','BNA000004DZD',
      function(type:string, etat:string){
      type.should.equals(VIR_EXTERNE)
      etat.should.equals('EMIS')
      // console.log(type,etat)
    },(error:any)=>{
      console.log(error)
    })
  })

  it('Doit retourner le type du virement: externe et état reçu',function(){
    let retour = GestionVirements.typeVirement('BNA000002DZD','THW000002DZD',
      function(type:string, etat:string){
      type.should.equals(VIR_EXTERNE)
      etat.should.equals('RECU')
      // console.log(type,etat)
    },(error:any)=>{
      console.log(error)
    })
  })

  it('Doit retourner le type du virement: NONE',function(){
    let retour = GestionVirements.typeVirement('BNA000002DZD','BNA000002DZD',
      function(type:string){
      // console.log(type,etat)
    },(error:any)=>{
      console.log(error)
      error.should.equals('NONE')
    })
  }) */
});