'use client';

import { GROUND_SIZE } from '@/lib/constants';

interface Props {
  dir: [number, number, number];
  up: boolean;
  showShadows: boolean;
}

const DIST = 50;

export default function SunLight({ dir, up, showShadows }: Props) {
  const x = dir[0] * DIST;
  const y = dir[1] * DIST;
  const z = dir[2] * DIST;
  const intensity = up ? 1.8 : 0.0;
  const half = GROUND_SIZE / 2;

  return (
    <>
      <directionalLight
        position={[x, Math.max(y, 0.1), z]}
        intensity={intensity}
        color={up ? '#fff7e6' : '#1a2238'}
        castShadow={showShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={DIST * 2.5}
        shadow-camera-left={-half}
        shadow-camera-right={half}
        shadow-camera-top={half}
        shadow-camera-bottom={-half}
        shadow-bias={-0.0005}
      />
      {up && (
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[1.4, 16, 16]} />
          <meshBasicMaterial color="#ffd54a" />
        </mesh>
      )}
    </>
  );
}
