import { Router } from 'express';
import { createUser } from '../controllers/createUsers';
import { sampleController } from '../controllers/sample.controller';

const router = Router();

router.post('/createUser', createUser);
router.get('/createUser', sampleController.getSampleData);

// router.post('/createUser', sampleController.createSampleData);

export { router as userCreateRouter };