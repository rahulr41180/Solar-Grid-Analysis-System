'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Sky } from '@react-three/drei';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectObject } from '@/store/sceneSlice';
import { Building as BuildingT, SolarTable as SolarTableT, Tank as TankT } from '@/types';
import { GROUND_SIZE } from '@/lib/constants';
import Building from './Building';
import Tank from './Tank';
import SolarTable from './SolarTable';
import SunLight from './SunLight';
import { useAnalysis, useScoreMap, useSunDirection } from '@/hooks/useAnalysis';

export default function SceneCanvas() {
  const dispatch = useAppDispatch();
  const objects = useAppSelector((s) => s.scene.objects);
  const selectedId = useAppSelector((s) => s.scene.selectedId);
  const { heatmap, showShadows } = useAppSelector((s) => s.settings);
  const { dir, up } = useSunDirection();
  const result = useAnalysis();
  const scoreMap = useScoreMap(result);

  const buildings = objects.filter((o): o is BuildingT => o.type === 'building');
  const tanks = objects.filter((o): o is TankT => o.type === 'tank');
  const tables = objects.filter((o): o is SolarTableT => o.type === 'table');

  return (
    <Canvas
      shadows={showShadows}
      camera={{ position: [18, 16, 22], fov: 45 }}
      onPointerMissed={() => dispatch(selectObject(null))}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[up ? '#bfe3ff' : '#0b1220']} />
      {up && <Sky sunPosition={[dir[0], dir[1], dir[2]]} turbidity={6} rayleigh={1.5} />}

      <ambientLight intensity={up ? 0.45 : 0.15} />
      <hemisphereLight intensity={up ? 0.4 : 0.1} groundColor="#3a3a3a" />
      <SunLight dir={dir} up={up} showShadows={showShadows} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={showShadows}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#5b7b4f" roughness={1} />
      </mesh>
      <Grid
        args={[GROUND_SIZE, GROUND_SIZE]}
        cellSize={1}
        sectionSize={5}
        cellColor="#6b8f5f"
        sectionColor="#3f5a37"
        position={[0, 0.01, 0]}
        infiniteGrid={false}
        fadeDistance={GROUND_SIZE}
      />

      {buildings.map((b) => (
        <Building
          key={b.id}
          building={b}
          selected={b.id === selectedId}
          showShadows={showShadows}
          onSelect={(id) => dispatch(selectObject(id))}
        />
      ))}
      {tanks.map((t) => (
        <Tank
          key={t.id}
          tank={t}
          selected={t.id === selectedId}
          showShadows={showShadows}
          onSelect={(id) => dispatch(selectObject(id))}
        />
      ))}
      {tables.map((t) => (
        <SolarTable
          key={t.id}
          table={t}
          scores={scoreMap.get(t.id) ?? []}
          heatmap={heatmap}
          showShadows={showShadows}
          selected={t.id === selectedId}
          onSelect={(id) => dispatch(selectObject(id))}
        />
      ))}

      <OrbitControls makeDefault enableDamping target={[0, 1, 0]} maxPolarAngle={Math.PI / 2.05} />
      <axesHelper args={[3]} />
    </Canvas>
  );
}
