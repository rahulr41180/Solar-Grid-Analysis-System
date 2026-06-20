import { Router } from 'express';
import { asyncHandler } from '../utils/http';
import * as shareController from '../controllers/shareController';

const router = Router();

router.get('/:token', asyncHandler(shareController.getShared));

export default router;
