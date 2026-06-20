import { Request, Response } from 'express';
import * as sceneService from '../services/sceneService';

export async function getShared(req: Request, res: Response) {
  const scene = await sceneService.getSharedScene(req.params.token);
  res.json({ scene });
}
