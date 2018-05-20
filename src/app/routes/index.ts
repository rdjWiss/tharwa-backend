// Importer ce dont on aura besoin de express
import { Router, Request, Response } from 'express';
import {authMiddleware} from '../../oauth2Server/middleware/authorization'
import { accessTokenExpireMiddleware,
  pinCodeExpireMiddleware, 
  refreshTokenExpireMiddleware } from '../../oauth2Server/middleware/tokenExpiration'
import {GestionComptes} from '../controllers/GestionComptes'
import {CreationComptes} from '../controllers/CreationComptes'
import {GestionVirements} from '../controllers/GestionVirements'

import{WebMiddleware,MobMiddleware} from '../middlewares/AppMiddleware'
import {creerUserMiddleware, creerAutreCompteBancaireMiddleware, modifStatutMiddleware, effectuerVirMiddleware} from '../middlewares/validationApp'
import { Converssion } from '../controllers/Converssion';
import { CODE_PIN_VALIDITE } from '../models/Parametre';
import { GestionBanque } from '../controllers/GestionBanque';

// Assigner à router l'instance de express.Router()
const router: Router = Router();

const gestionComptes = new GestionComptes();
const creationComptes = new CreationComptes();
const gestionVir = new GestionVirements();
const converssion = new Converssion();
const gestionBanque = new GestionBanque()

router.use(authMiddleware)
//router.use(TokensExpireMiddleware)

//***** Gestion de comptes
//Vérifier si un email existe
router.get('/users/:userEmail',gestionComptes.userExist);//to oauth
//Filtrer les comptes bancaires selon le statut (paramètre)
router.get('/comptes/',WebMiddleware,gestionComptes.getComptes)
//Mettre à jour le statut d'un compte bancaire
router.put('/comptes/:numCompte',modifStatutMiddleware,WebMiddleware,gestionComptes.modifCompte)
//Récuperer les comptes d'un user
router.get('/users/:idUser/comptes',MobMiddleware,gestionComptes.getComptesClient)
//Récupérer l'historique d'un compte
router.get('/historique',accessTokenExpireMiddleware,pinCodeExpireMiddleware,
            MobMiddleware,gestionComptes.getHistorique)
//Récupérer les comptes pour déblocage selon des critères
router.get('/comptes/rech/', WebMiddleware, accessTokenExpireMiddleware,
                  gestionComptes.getComptesParFiltrage)


//**** Création des comptes
//Créer un nouveau compte utilisateur
router.post('/users',creerUserMiddleware,creationComptes.creerCompteUser)//to oauth
//Créer un autre compte bancaire
router.post('/comptes',creerAutreCompteBancaireMiddleware,MobMiddleware,creationComptes.creerCompteBancaire)

//*** Gestion Virements
//Récupérer le seuil de validation d'un virement
router.get('/virements/seuil',MobMiddleware,gestionVir.getSeuil)
//Effectuer virements entre comptes du meme client
router.post('/virements/1',effectuerVirMiddleware,MobMiddleware, gestionVir.virementEntreComptes)
//Effectuer virement entre clients tharwa
router.post('/virements/2',effectuerVirMiddleware,MobMiddleware, gestionVir.virementEntreClientsTharwa)
//Récupérer la liste des virements à valider
router.get('/virements',WebMiddleware,gestionVir.getVirementAValider)
//Modifier le statut d'un virement (valider/rejeter)
router.put('/virements/:codeVir',modifStatutMiddleware,WebMiddleware,gestionVir.modifStatutVir)

//Taux de change
router.post('/convertir/',converssion.convertir)

/** Gestion de la banque */
router.get('/gestion/banquiers', accessTokenExpireMiddleware, gestionBanque.getListBanquiers)

//TODO: remove
router.post('/image', creationComptes.image)

//Toutes les autres routes
router.all('*',function(req,res){
  res.sendStatus(404);
})

// Exporter l'instance de express.Router()
export const IndexRoutes: Router = router;