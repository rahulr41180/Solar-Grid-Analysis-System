import { Router } from 'express';
import { asyncHandler } from '../utils/http';
import { optionalAuth } from '../middleware/auth';
import * as analysisController from '../controllers/analysisController';

const router = Router();

router.get('/:id/analyses', optionalAuth, asyncHandler(analysisController.listForScene));
router.post('/:id/analyses', optionalAuth, asyncHandler(analysisController.snapshot));
router.post('/:id/daily-analysis', optionalAuth, asyncHandler(analysisController.daily));
router.get('/:id/report.csv', optionalAuth, asyncHandler(analysisController.reportCsv));

export default router;
