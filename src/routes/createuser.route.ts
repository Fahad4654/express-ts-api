import { Router } from 'express';
import { createUser } from '../controllers/createUsers.controller';


const router = Router();

router.post('/', createUser);

export { router as userCreateRouter };