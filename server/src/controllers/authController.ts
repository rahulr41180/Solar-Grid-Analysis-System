import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  const result = await authService.registerUser(email, password);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  const result = await authService.loginUser(email, password);
  res.json(result);
}

export async function me(req: Request, res: Response) {
  res.json({ user: { id: req.user!.userId, email: req.user!.email } });
}
