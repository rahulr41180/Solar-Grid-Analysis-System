import { Router } from 'express';
import { asyncHandler } from '../utils/http';
import * as analysisController from '../controllers/analysisController';

const router = Router();

// POST /api/analyze  -> stateless analysis (no DB, no auth)
router.post('/', asyncHandler(analysisController.analyze));

export default router;
