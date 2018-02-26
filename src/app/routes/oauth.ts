
import { Router, Request, Response } from 'express';
import { loginController }  from '../controllers/authController';
import  { OAuthnetification } from '../oauth2Server/authentification'
const router: Router = Router();

const auth=new OAuthnetification();
// Login Controller permet de s'authentifier 
router.post('/login',loginController);
router.post('/access',function(req:Request,res:Response){
        res.json(req.body)
})
router.post('/token',auth.login)


// Export the express.Router() instance to be used by server.ts
export const OauthRouter: Router = router;