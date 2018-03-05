
import { Router, Request, Response } from 'express';
import  { OAuthnetification } from '../controllers/authentification'
import { PasswordResetController } from '../controllers/passwordReset'

import {authMiddleware} from '../middleware/authorization'
import { tokenMiddleware, resetPassMiddleware, loginMiddleware } from '../middleware/validation';

const router: Router = Router();

const auth=new OAuthnetification();
const reset = new PasswordResetController();

// Limiter l'acces a ces routes aux applications authorisées
router.use(authMiddleware)

//Les routes d'authentification
router.post('/login',loginMiddleware, auth.login)
router.post('/verifier',tokenMiddleware,auth.verifyToken)
router.post('/choisir',auth.choisir)

//Les routes de password reset
router.post('/resetpassword',resetPassMiddleware, reset.askReset )

//Toutes les autres routes
router.all('*',function(req,res){
        res.sendStatus(404);
})

// Exporter express.Router() instanceà utiliser par server.ts
export const OauthRouter: Router = router;