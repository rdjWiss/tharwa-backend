
import { Router, Request, Response } from 'express';
import { loginController }  from '../app/controllers/authController';
import  { OAuthnetification } from './authentification'
import {authMiddleware} from './middleware/authorization'
const router: Router = Router();

const auth=new OAuthnetification();

// Limiter l'acces a ces routes au application authorizé
router.use(authMiddleware)
// Login Controller permet de s'authentifier 
router.post('/access',function(req:Request,res:Response){
        res.json(req.body)
})
router.post('/token',auth.login)
router.post('/verifier',auth.verifyToken)

// Export the express.Router() instance to be used by server.ts
export const OauthRouter: Router = router;