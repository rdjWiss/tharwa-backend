import * as Chai from 'chai'
import { CreationComptes } from '../../app/controllers/CreationComptes';
import { regexpNumCompte, Compte } from '../../app/models/Compte';
import { GestionComptes } from '../../app/controllers/GestionComptes';
import { STATUT_COMPTE_AVALIDER, STATUT_COMPTE_ACTIF, STATUT_COMPTE_REJETE, STATUT_COMPTE_BLOQUE } from '../../app/models/StatutCompte';
import { COMPTE_COURANT, typeCompteString } from '../../app/models/TypeCompte';

var should= Chai.should()

let gestionComptes= new GestionComptes()

describe('Gestion des comptes bancaires', function () {
  it('Le numéro du compte doit correspondre à l\'expression régulière du numero de compte', function(){
    CreationComptes.genererNouveauNumeroCompte('DZD',function(numCompte:string){
      // numCompte.should.match(/[A-Z]{3}\d{6}[A-Z]{3}/)
      numCompte.should.match(regexpNumCompte)
    }, (error:any)=>{

    })
  })

  it('Doit créer un compte bancaire courant', function () {
   let balance = 0.0
   let monnaie = 'DZD'
   let userId = 6

   CreationComptes.creerCompteCourant({id:userId},function(created:any){
     created.should.have.property('num_compte')
     created.should.have.property("balance").equals(balance)
     created.should.have.property("code_monnaie").equals(monnaie)
     created.should.have.property("id_user").equals(userId)
     created.should.have.property('type_compte').equals(COMPTE_COURANT)
     created.should.have.property('statut_actuel').equals(STATUT_COMPTE_AVALIDER)
     console.log(created.dataValues)

     Compte.destroy({
       where:{
         num_compte:created.num_compte
       }
     })
   },(error:any)=>{
     console.log(error)
   });
     
  })

  it(`Doit retourner true si la modification(passage) de status est valid `,function(){
    var retour = gestionComptes.isValidChangementStatut(STATUT_COMPTE_AVALIDER,STATUT_COMPTE_ACTIF)
    retour.should.equals(true)

    retour = gestionComptes.isValidChangementStatut(STATUT_COMPTE_AVALIDER,STATUT_COMPTE_REJETE)
    retour.should.equals(true)

    retour = gestionComptes.isValidChangementStatut(STATUT_COMPTE_ACTIF,STATUT_COMPTE_BLOQUE)
    retour.should.equal(true)

    retour = gestionComptes.isValidChangementStatut(STATUT_COMPTE_BLOQUE,STATUT_COMPTE_ACTIF)
    retour.should.equals(true)
  })

  it('Doit retourner false si la modification(passage) de status est non valid',function(){
    var retour = gestionComptes.isValidChangementStatut(STATUT_COMPTE_REJETE,STATUT_COMPTE_ACTIF)
    retour.should.equals(false)

    retour = gestionComptes.isValidChangementStatut(STATUT_COMPTE_ACTIF,STATUT_COMPTE_REJETE)
    retour.should.equals(false)

    retour = gestionComptes.isValidChangementStatut(STATUT_COMPTE_ACTIF,STATUT_COMPTE_AVALIDER)
    retour.should.equals(false)

    retour = gestionComptes.isValidChangementStatut(STATUT_COMPTE_BLOQUE,STATUT_COMPTE_REJETE)
    retour.should.equals(false)
  })

  it('Doit retourner true si le changement de statut nécessite un motif',function(){
    var retour = GestionComptes.isChangementStatutNecessitantMotif(STATUT_COMPTE_AVALIDER,STATUT_COMPTE_REJETE)
    retour.should.equals(true)

    var retour = GestionComptes.isChangementStatutNecessitantMotif(STATUT_COMPTE_ACTIF,STATUT_COMPTE_BLOQUE)
    retour.should.equals(true)

    var retour = GestionComptes.isChangementStatutNecessitantMotif(STATUT_COMPTE_BLOQUE,STATUT_COMPTE_ACTIF)
    retour.should.equals(true)
  })

  it('Doit retourner le type du compte (designation)',function(){
    var type = typeCompteString(1)
    type.should.equals('Courant')

    type = typeCompteString(2)
    type.should.equals('Epargne')

    type = typeCompteString(3)
    type.should.equals('Devise')
  })
});