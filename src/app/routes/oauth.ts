
import { Router, Request, Response } from 'express';
import { loginController }  from '../controllers/authController';
const router: Router = Router();

// Login Controller permet de s'authentifier 
router.post('/login',loginController);
router.post('/access',function(req:Request,res:Response){
        res.json(req.body)
})



// Export the express.Router() instance to be used by server.ts
export const OauthRouter: Router = router;