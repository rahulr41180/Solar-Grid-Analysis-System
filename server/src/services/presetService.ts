// Business logic for presets.
import { parseJson } from '../config/db';
import { SceneObject } from '../analysis/types';
import { listPresets as listPresetRows } from '../models/presetModel';

export async function listPresets() {
  const rows = await listPresetRows();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    objects: parseJson<SceneObject[]>(r.data),
  }));
}
