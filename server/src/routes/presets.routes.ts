import { Router } from 'express';
import { asyncHandler } from '../utils/http';
import * as presetController from '../controllers/presetController';

const router = Router();

router.get('/', asyncHandler(presetController.list));

export default router;
