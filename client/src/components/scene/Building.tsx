'use client';

import { ThreeEvent } from '@react-three/fiber';
import { Building as BuildingT } from '@/types';

interface Props {
  building: BuildingT;
  selected: boolean;
  showShadows: boolean;
  onSelect: (id: string) => void;
}

export default function Building({ building, selected, showShadows, onSelect }: Props) {
  const { x, y, width, length, height } = building;
  return (
    <mesh
      position={[x, height / 2, y]}
      castShadow={showShadows}
      receiveShadow={showShadows}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(building.id);
      }}
    >
      <boxGeometry args={[width, height, length]} />
      <meshStandardMaterial
        color={selected ? '#fcd34d' : '#94a3b8'}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
}
