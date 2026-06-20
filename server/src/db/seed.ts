// Seeds the `presets` table with a few example sites.
// Run with: npm run seed
import crypto from 'crypto';
import { pool } from '../config/db';
import { SceneObject } from '../analysis/types';

const id = () => crypto.randomUUID();

function table(x: number, y: number): SceneObject {
  return { id: id(), type: 'table', x, y, azimuth: 0 };
}

const PRESETS: { name: string; description: string; data: SceneObject[] }[] = [
  {
    name: 'Open Field',
    description: 'Two tables with no nearby obstructions — baseline best case.',
    data: [table(-3, 0), table(3, 0)],
  },
  {
    name: 'Dense Urban',
    description: 'Tall buildings on the south and east cause heavy afternoon shading.',
    data: [
      table(-3, 0),
      table(3, 0),
      { id: id(), type: 'building', x: -2, y: 9, width: 6, length: 5, height: 14 },
      { id: id(), type: 'building', x: 8, y: 2, width: 5, length: 8, height: 11 },
      { id: id(), type: 'building', x: -10, y: -4, width: 4, length: 4, height: 9 },
    ],
  },
  {
    name: 'Tank Farm',
    description: 'Cluster of water tanks of varying height beside the array.',
    data: [
      table(-3, 0),
      table(3, 0),
      { id: id(), type: 'tank', x: 6, y: 4, radius: 2, height: 7 },
      { id: id(), type: 'tank', x: 9, y: -1, radius: 1.5, height: 5 },
      { id: id(), type: 'tank', x: 6, y: -5, radius: 2.5, height: 9 },
    ],
  },
];

async function seed() {
  try {
    for (const p of PRESETS) {
      await pool.query(
        `INSERT INTO presets (name, description, data) VALUES (?, ?, CAST(? AS JSON))
         ON DUPLICATE KEY UPDATE description = VALUES(description), data = VALUES(data)`,
        [p.name, p.description, JSON.stringify(p.data)]
      );
    }
    console.log(`✓ Seeded ${PRESETS.length} presets.`);
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
