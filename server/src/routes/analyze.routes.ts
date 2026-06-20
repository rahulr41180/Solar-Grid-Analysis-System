import { Router } from 'express';
import { asyncHandler } from '../utils/http';
import * as analysisController from '../controllers/analysisController';

const router = Router();

router.post('/', asyncHandler(analysisController.analyze));

export default router;
