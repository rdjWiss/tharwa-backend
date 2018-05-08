// Importer ce dont on aura besoin de express
import { Router, Request, Response } from 'express';
import {authMiddleware} from '../../oauth2Server/middleware/authorization'
import { TokensExpireMiddleware } from '../middlewares/tokenExpiration'
import {GestionComptes} from '../controllers/GestionComptes'
import {CreationComptes} from '../controllers/CreationComptes'
import {GestionVirements} from '../controllers/GestionVirements'

import{WebMiddleware,MobMiddleware} from '../middlewares/AppMiddleware'
import {creerUserMiddleware} from '../middlewares/validationApp'
import { Converssion } from '../controllers/Converssion';

// Assigner à router l'instance de express.Router()
const router: Router = Router();

const gestionComptes = new GestionComptes();
const creationComptes = new CreationComptes();
const gestionVir = new GestionVirements();
const converssion = new Converssion();

router.use(authMiddleware)
//router.use(TokensExpireMiddleware)

//***** Gestion de comptes
//Vérifier si un email existe
router.get('/users/:userEmail',gestionComptes.userExist);//to oauth
//Filtrer les comptes bancaires selon le statut (paramètre)
router.get('/comptes',WebMiddleware,gestionComptes.getComptes)
//Mettre à jour le statut d'un compte bancaire
router.put('/comptes/:numCompte',WebMiddleware,gestionComptes.modifCompte)
//Récuperer les comptes d'un user
router.get('/users/:idUser/comptes',MobMiddleware,gestionComptes.getComptesClient)


//**** Création des comptes
//Créer un nouveau compte utilisateur
router.post('/users',creerUserMiddleware,creationComptes.creerCompteUser)//to oauth
//Créer un autre compte bancaire
router.post('/comptes',MobMiddleware,creationComptes.creerCompteBancaire)

//*** Gestion Virements
//Récupérer le seuil de validation d'un virement
router.get('/virements/seuil',MobMiddleware,gestionVir.getSeuil)
//Effectuer virements entre comptes du meme client
router.post('/virements/1',MobMiddleware, gestionVir.virementEntreComptes)
//Effectuer virement entre clients tharwa
router.post('/virements/2',MobMiddleware, gestionVir.virementEntreClientsTharwa)
//Récupérer la liste des virements à valider
router.get('/virements',WebMiddleware,gestionVir.getVirementAValider)
//Modifier le statut d'un virement (valider/rejeter)
router.put('/virements/:codeVir',WebMiddleware,gestionVir.modifStatutVir)

//Taux de change
router.post('/convertir',converssion.convertir)

//TODO: remove
router.post('/image', creationComptes.image)

//Toutes les autres routes
router.all('*',function(req,res){
  res.sendStatus(404);
})

// Exporter l'instance de express.Router()
export const IndexRoutes: Router = router;