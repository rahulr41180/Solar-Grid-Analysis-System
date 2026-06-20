'use client';

import { ThreeEvent } from '@react-three/fiber';
import { Tank as TankT } from '@/types';

interface Props {
  tank: TankT;
  selected: boolean;
  showShadows: boolean;
  onSelect: (id: string) => void;
}

export default function Tank({ tank, selected, showShadows, onSelect }: Props) {
  const { x, y, radius, height } = tank;
  return (
    <mesh
      position={[x, height / 2, y]}
      castShadow={showShadows}
      receiveShadow={showShadows}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(tank.id);
      }}
    >
      <cylinderGeometry args={[radius, radius, height, 24]} />
      <meshStandardMaterial
        color={selected ? '#fcd34d' : '#60a5fa'}
        roughness={0.4}
        metalness={0.2}
      />
    </mesh>
  );
}
