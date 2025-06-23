import { Router } from 'express';
import { deleteUser } from '../controllers/deleteUsers';

const router = Router();

// ✅ Correct: DELETE method with proper typing
router.delete('/', deleteUser);

export { router as userDeleteRouter };