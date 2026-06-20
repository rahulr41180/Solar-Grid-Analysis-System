import { Request, Response } from 'express';
import * as analysisService from '../services/analysisService';

export async function analyze(req: Request, res: Response) {
  const out = analysisService.runStateless(req.body ?? {});
  res.json(out);
}

export async function listForScene(req: Request, res: Response) {
  const analyses = await analysisService.listForScene(req.user?.userId, req.params.id);
  res.json({ analyses });
}

export async function snapshot(req: Request, res: Response) {
  const out = await analysisService.storeSnapshot(req.user?.userId, req.params.id, req.body ?? {});
  res.status(201).json(out);
}

export async function daily(req: Request, res: Response) {
  const summary = await analysisService.runDaily(req.user?.userId, req.params.id, req.body ?? {});
  res.status(201).json({ summary });
}

export async function reportCsv(req: Request, res: Response) {
  const { filename, csv } = await analysisService.buildCsv(
    req.user?.userId,
    req.params.id,
    req.query as Record<string, unknown>
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
