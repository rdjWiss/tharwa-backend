
import { Router, Request, Response } from 'express';
import  { OAuthnetification } from '../controllers/authentification'
import { PasswordResetController } from '../controllers/passwordReset'

import {authMiddleware, expireMiddleware} from '../middleware/authorization'
import { tokenMiddleware, resetPassMiddleware, loginMiddleware } from '../middleware/validation';
import {  refreshTokenExpireMiddleware, accessTokenExpireMiddleware, pinCodeExpireMiddleware } from '../middleware/tokenExpiration';
import { RefreshTokens } from '../controllers/refreshTokens';

const router: Router = Router();

const auth=new OAuthnetification();
const reset = new PasswordResetController();
const refresh = new RefreshTokens()

// Limiter l'acces à ces routes aux applications authorisées
router.use(authMiddleware)

//Les routes d'authentification
router.post('/login',loginMiddleware, auth.login)
router.post('/verifier',tokenMiddleware,expireMiddleware,auth.verifyToken)
router.post('/choisir',expireMiddleware,auth.choisir)

//Les routes de password reset
router.post('/resetpassword',resetPassMiddleware, reset.askReset )

//Refresh access token
router.post('/refreshaccess',refreshTokenExpireMiddleware,refresh.refreshAccessToken)
router.post('/refreshpin/1',accessTokenExpireMiddleware,auth.choisir )//refresh.refreshPinChoisir)
router.post('/refreshpin/2',accessTokenExpireMiddleware,auth.verifyToken)

//Route de vérification de validité du code pin
router.get('/codepinvalide',pinCodeExpireMiddleware, refresh.codePinValide)

//Route de test de validité (mobile)
router.post('/testtokens',accessTokenExpireMiddleware,pinCodeExpireMiddleware,refresh.test)


//Toutes les autres routes
router.all('*',function(req,res){
        res.sendStatus(404);
})

// Exporter express.Router() instance à utiliser par server.ts
export const OauthRouter: Router = router;