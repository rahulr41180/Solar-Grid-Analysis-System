import { Request, Response } from 'express';
import * as sceneService from '../services/sceneService';

// GET /api/share/:token  (public, read-only)
export async function getShared(req: Request, res: Response) {
  const scene = await sceneService.getSharedScene(req.params.token);
  res.json({ scene });
}
