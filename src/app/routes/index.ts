/* app/controllers/welcomeController.ts */

// Import only what we need from express
import { Router, Request, Response } from 'express';
import { loginController } from '../controllers/authController';
import {OauthRouter} from './oauth'
// Assign router to the express.Router() instance
const router: Router = Router();

// The / here corresponds to the route that the WelcomeController
// is mounted on in the server.ts file.
// In this case it's /welcome
router.get('/', (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
    res.send('Hello, Test!');
});

// Les routes de Oauth2
router.use('/authserver',OauthRouter)

// Export the express.Router() instance to be used by server.ts
export const IndexRoutes: Router = router;