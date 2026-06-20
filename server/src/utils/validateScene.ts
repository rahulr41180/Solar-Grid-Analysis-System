import { SceneObject } from '../analysis/types';
import { badRequest } from './http';

const TYPES = new Set(['building', 'tank', 'table']);

export function validateSceneObjects(input: unknown): SceneObject[] {
  if (!Array.isArray(input)) throw badRequest('`objects` must be an array');
  for (const o of input) {
    if (!o || typeof o !== 'object') throw badRequest('Each object must be an object');
    const obj = o as Record<string, unknown>;
    if (typeof obj.type !== 'string' || !TYPES.has(obj.type))
      throw badRequest(`Invalid object type: ${String(obj.type)}`);
    if (typeof obj.x !== 'number' || typeof obj.y !== 'number')
      throw badRequest('Object x/y must be numbers');
  }
  return input as SceneObject[];
}
