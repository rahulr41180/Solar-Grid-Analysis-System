import { Request, Response } from 'express';
import * as sceneService from '../services/sceneService';

export async function list(req: Request, res: Response) {
  const scenes = await sceneService.listScenes(req.user?.userId);
  res.json({ scenes });
}

export async function create(req: Request, res: Response) {
  const { name, objects } = req.body ?? {};
  const scene = await sceneService.createScene(req.user?.userId, name, objects);
  res.status(201).json({ scene });
}

export async function getOne(req: Request, res: Response) {
  const scene = await sceneService.getScene(req.user?.userId, req.params.id);
  res.json({ scene });
}

export async function update(req: Request, res: Response) {
  const { name, objects } = req.body ?? {};
  const scene = await sceneService.updateScene(req.user?.userId, req.params.id, { name, objects });
  res.json({ scene });
}

export async function remove(req: Request, res: Response) {
  await sceneService.removeScene(req.user?.userId, req.params.id);
  res.status(204).end();
}

export async function share(req: Request, res: Response) {
  const out = await sceneService.shareScene(req.user?.userId, req.params.id);
  res.json(out);
}
