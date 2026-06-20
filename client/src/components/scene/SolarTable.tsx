'use client';

import { ThreeEvent } from '@react-three/fiber';
import { SolarTable as SolarTableT } from '@/types';
import { panelLayouts, tableEuler, tablePosition } from '@/lib/geometry';
import { PANEL_W, PANEL_H } from '@/lib/constants';
import { scoreColor } from '@/lib/shadowAnalysis';

interface Props {
  table: SolarTableT;
  scores: number[]; // panelIndex -> score
  heatmap: boolean;
  showShadows: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}

const layouts = panelLayouts();

export default function SolarTable({
  table,
  scores,
  heatmap,
  showShadows,
  selected,
  onSelect,
}: Props) {
  const pos = tablePosition(table);
  const euler = tableEuler(table);

  return (
    <group>
      {/* Tilted panel array */}
      <group
        position={pos}
        rotation={euler}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(table.id);
        }}
      >
        {layouts.map((l) => {
          const score = scores[l.panelIndex] ?? 100;
          const color = heatmap ? scoreColor(score) : '#1e3a5f';
          return (
            <mesh
              key={l.panelIndex}
              position={l.offset}
              castShadow={showShadows}
              receiveShadow={showShadows}
            >
              <planeGeometry args={[PANEL_W, PANEL_H]} />
              <meshStandardMaterial
                color={color}
                emissive={selected ? '#fcd34d' : '#000000'}
                emissiveIntensity={selected ? 0.25 : 0}
                roughness={0.35}
                metalness={0.5}
                side={2 /* DoubleSide */}
              />
            </mesh>
          );
        })}
      </group>

      {/* Simple support post at the table centre */}
      <mesh position={[table.x, pos[1] / 2, table.y]} castShadow={showShadows}>
        <boxGeometry args={[0.15, pos[1], 0.15]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}
