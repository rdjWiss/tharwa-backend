import * as Chai from 'chai'
import { GestionVirements } from "../../app/controllers/GestionVirements";
import { STATUT_COMPTE_ACTIF, STATUT_COMPTE_BLOQUE, STATUT_COMPTE_AVALIDER, STATUT_COMPTE_REJETE } from '../../app/models/StatutCompte';
import { COMPTE_COURANT, COMPTE_DEVISE, COMPTE_EPARGNE, typeCompteString } from '../../app/models/TypeCompte';
import { CreationComptes } from '../../app/controllers/CreationComptes';
import { getUserContact } from '../../oauth2Server/models/User';
import { STATUT_VIR_AVALIDER, STATUT_VIR_VALIDE, STATUT_VIR_REJETE } from '../../app/models/StatutVirement';
import { GestionComptes } from '../../app/controllers/GestionComptes';
import { Compte, regexpNumCompte } from '../../app/models/Compte';
import { Virement, regexpCodeVir, VIR_INTERNE, VIR_EXTERNE } from '../../app/models/Virement';
import { image_base64 } from '../integrationTests/gestionVirements.test';
import * as Jwt from '../../oauth2Server/jwtconf';
import { expireMiddleware } from '../../oauth2Server/middleware/authorization';
import { tokenExpired } from '../../oauth2Server/middleware/tokenExpiration';
import { getTypeCommission } from '../../app/models/Commission';
import { getMessageErreur } from '../../config/errorMsg';


var should= Chai.should()

let userId = 6
// OK
/* describe('Gestion des virements', function () {
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

  it('Doit retourner le type du virement: interne',function(){
    let retour = GestionVirements.typeVirement('THW000002DZD','THW000004DZD',function(type:string){
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
  })
}); */

/* describe('Gestion des comptes bancaires', function () {
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
    var retour = GestionComptes.isValidChangementStatut(STATUT_COMPTE_AVALIDER,STATUT_COMPTE_ACTIF)
    retour.should.equals(true)

    retour = GestionComptes.isValidChangementStatut(STATUT_COMPTE_AVALIDER,STATUT_COMPTE_REJETE)
    retour.should.equals(true)

    retour = GestionComptes.isValidChangementStatut(STATUT_COMPTE_ACTIF,STATUT_COMPTE_BLOQUE)
    retour.should.equal(true)

    retour = GestionComptes.isValidChangementStatut(STATUT_COMPTE_BLOQUE,STATUT_COMPTE_ACTIF)
    retour.should.equals(true)
  })

  it('Doit retourner false si la modification(passage) de status est non valid',function(){
    var retour = GestionComptes.isValidChangementStatut(STATUT_COMPTE_REJETE,STATUT_COMPTE_ACTIF)
    retour.should.equals(false)

    retour = GestionComptes.isValidChangementStatut(STATUT_COMPTE_ACTIF,STATUT_COMPTE_REJETE)
    retour.should.equals(false)

    retour = GestionComptes.isValidChangementStatut(STATUT_COMPTE_ACTIF,STATUT_COMPTE_AVALIDER)
    retour.should.equals(false)

    retour = GestionComptes.isValidChangementStatut(STATUT_COMPTE_BLOQUE,STATUT_COMPTE_REJETE)
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
}); */

/* describe('Gestion des users', function () {
  it('Doit retourner le nom, email et telephone du user', function(){
    var id = 6
    getUserContact(id, function(user:any){
      // console.log(user)
      user.should.have.property('nom')
      user.should.have.property('email')
      user.should.have.property('tel')
    },(error:any)=>{
      error.should.equal('User not found')
    })
  })

}); */
/* 
describe('Gestion des tokens',function(){
  it('Doit retourner false si le token n\'a pas expiré',function(){
    let token = Jwt.encode({
      user:'here',
      exp:Jwt.expiresIn(60)//1 heure
    })
    let decoded = Jwt.decode(token)

    var dateNow = new Date();
    let retour = tokenExpired(decoded.exp,dateNow)
    retour.should.equals(false)
  })

  it('Doit retourner false si le token n\'a pas expiré',function(){
    let token = Jwt.encode({
      user:'here',
      exp:Jwt.expiresIn(1)//1minute
    })
    let decoded = Jwt.decode(token)

    var dateNow = new Date().getTime();
    dateNow+= (2* 60 * 1000)

    let retour =  tokenExpired(decoded.exp,new Date(dateNow))
    retour.should.equals(true)
    
  })
}) */

/* describe('Historique',function(){
  it('Doit retourner le type de la commission selon l\'id',function(){
    let type = getTypeCommission(2)
    type.should.equals("Epargne vers courant")
  })
}) */

/* describe('Récupération du message d\'erreur',function(){
  it('Doit retourner le message d\'erreur correspondant au code d\'erreur',function(){
    let msg = getMessageErreur('D00')
    msg.should.equals('Erreur DB')
    console.log(msg)

    // console.log(getMessageErreur('A01'))
    // console.log(getMessageErreur('U01'))
    // console.log(getMessageErreur('C01'))
    // console.log(getMessageErreur('V01'))
    // console.log(getMessageErreur('D01'))
  })
}) */