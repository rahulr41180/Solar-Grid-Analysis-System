import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../models/userModel';
import { signToken } from '../utils/token';
import { badRequest, unauthorized } from '../utils/http';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthResult {
  token: string;
  user: { id: number; email: string };
}

export async function registerUser(email: string, password: string): Promise<AuthResult> {
  if (!email || !emailRe.test(email)) throw badRequest('Valid email is required');
  if (!password || password.length < 6)
    throw badRequest('Password must be at least 6 characters');

  const hash = await bcrypt.hash(password, 10);
  const id = await createUser(email, hash);
  return { token: signToken({ userId: id, email }), user: { id, email } };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  if (!email || !password) throw badRequest('Email and password are required');

  const user = await findUserByEmail(email);
  if (!user) throw unauthorized('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw unauthorized('Invalid credentials');

  return {
    token: signToken({ userId: user.id, email: user.email }),
    user: { id: user.id, email: user.email },
  };
}
