import { Router } from 'express';
import { asyncHandler } from '../utils/http';
import { optionalAuth } from '../middleware/auth';
import * as sceneController from '../controllers/sceneController';

const router = Router();

router.get('/', optionalAuth, asyncHandler(sceneController.list));
router.post('/', optionalAuth, asyncHandler(sceneController.create));
router.get('/:id', optionalAuth, asyncHandler(sceneController.getOne));
router.put('/:id', optionalAuth, asyncHandler(sceneController.update));
router.delete('/:id', optionalAuth, asyncHandler(sceneController.remove));
router.post('/:id/share', optionalAuth, asyncHandler(sceneController.share));

export default router;
