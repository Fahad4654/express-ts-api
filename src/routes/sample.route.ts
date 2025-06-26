import { Router } from 'express';
import { sampleController } from '../controllers/sample.controller';

const router = Router();

router.get('/', sampleController.getSampleData);
router.post('/', sampleController.createSampleData);

export { router as sampleRouter };
export { router };