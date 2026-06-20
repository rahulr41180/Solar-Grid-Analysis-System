import { Request, Response } from 'express';
import * as presetService from '../services/presetService';

export async function list(_req: Request, res: Response) {
  const presets = await presetService.listPresets();
  res.json({ presets });
}
