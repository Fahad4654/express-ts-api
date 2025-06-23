import { Router } from 'express';
import { createUser } from '../controllers/createUsers';


const router = Router();

router.post('/', createUser);

export { router as userCreateRouter };