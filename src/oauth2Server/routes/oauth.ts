
import { Router, Request, Response } from 'express';
import  { OAuthnetification } from '../controllers/authentification'
import { PasswordResetController } from '../controllers/passwordReset'

import {authMiddleware} from '../middleware/authorization'
import { tokenMiddleware, resetPassMiddleware } from '../middleware/validation';

const router: Router = Router();

const auth=new OAuthnetification();
const reset = new PasswordResetController();
// Limiter l'acces a ces routes au application authorizé
router.use(authMiddleware)

router.post('/login',auth.login)
router.post('/verifier',tokenMiddleware,auth.verifyToken)
router.post('/choisir',auth.choisir)
/* Password Reset Routes */ 
router.post('/resetpassword',resetPassMiddleware, reset.askReset )



router.all('*',function(req,res){
        res.sendStatus(404);
})

// Export the express.Router() instance to be used by server.ts
export const OauthRouter: Router = router;