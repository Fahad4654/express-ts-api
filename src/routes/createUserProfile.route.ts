import { Router } from 'express';
import { createUserProfile } from '../controllers/userProfile.controller';


const router = Router();

router.post('/', createUserProfile);

export { router as userProfileCreateRouter };
export { router };