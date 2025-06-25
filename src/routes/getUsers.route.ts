import { Router } from 'express';
import { getUsers } from '../controllers/users.controller';

const router = Router();

router.get('/', getUsers);

export { router as userListRouter };
export { router };