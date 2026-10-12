import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** 3D electromagnetic wave: E (vertical) and B (horizontal) in phase, both ⟂ to propagation (x). */
function Wave({ colourE, colourB, paused }: { colourE: string; colourB: string; paused: boolean }) {
  const N = 120;
  const L = 8;
  const eGeo = useMemo(() => new THREE.BufferGeometry(), []);
  const bGeo = useMemo(() => new THREE.BufferGeometry(), []);
  const eCurve = useMemo(() => new THREE.BufferGeometry(), []);
  const bCurve = useMemo(() => new THREE.BufferGeometry(), []);
  const t = useRef(0);
  const eLine = useMemo(() => new THREE.Line(eCurve, new THREE.LineBasicMaterial({ color: colourE })), [eCurve, colourE]);
  const bLine = useMemo(() => new THREE.Line(bCurve, new THREE.LineBasicMaterial({ color: colourB })), [bCurve, colourB]);
  const ePos = useMemo(() => new Float32Array(N * 6), []);
  const bPos = useMemo(() => new Float32Array(N * 6), []);
  const eC = useMemo(() => new Float32Array(N * 3), []);
  const bC = useMemo(() => new Float32Array(N * 3), []);
  useMemo(() => {
    eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    eCurve.setAttribute('position', new THREE.BufferAttribute(eC, 3));
    bCurve.setAttribute('position', new THREE.BufferAttribute(bC, 3));
  }, [eGeo, bGeo, eCurve, bCurve, ePos, bPos, eC, bC]);

  useFrame((_, dt) => {
    if (!paused) t.current += dt;
    for (let i = 0; i < N; i++) {
      const x = -L / 2 + (L * i) / (N - 1);
      const ph = 2 * Math.PI * (x / 2.5) - 3 * t.current;
      const a = Math.sin(ph);
      ePos.set([x, 0, 0, x, 1.3 * a, 0], i * 6);
      bPos.set([x, 0, 0, x, 0, 1.0 * a], i * 6);
      eC.set([x, 1.3 * a, 0], i * 3);
      bC.set([x, 0, 1.0 * a], i * 3);
    }
    (eGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (bGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (eCurve.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (bCurve.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <group rotation={[0.35, -0.6, 0]}>
      <lineSegments geometry={eGeo}>
        <lineBasicMaterial color={colourE} transparent opacity={0.45} />
      </lineSegments>
      <lineSegments geometry={bGeo}>
        <lineBasicMaterial color={colourB} transparent opacity={0.45} />
      </lineSegments>
      <primitive object={eLine} />
      <primitive object={bLine} />
      <mesh position={[L / 2 + 0.25, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.4, 16]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([-L / 2, 0, 0, L / 2, 0, 0])} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#94a3b8" />
      </lineSegments>
    </group>
  );
}

export default function EMWave3D({ colourE = '#22d3ee', colourB = '#a78bfa', paused = false }: { colourE?: string; colourB?: string; paused?: boolean }) {
  return (
    <div className="relative h-60 w-full" role="img" aria-label="3D animation of an electromagnetic wave: electric field oscillating vertically, magnetic field horizontally, both perpendicular to the direction of travel">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.5]} frameloop={paused ? 'demand' : 'always'}>
        <Wave colourE={colourE} colourB={colourB} paused={paused} />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-3 flex gap-4 text-xs">
        <span style={{ color: colourE }}>■ Electric field E</span>
        <span style={{ color: colourB }}>■ Magnetic field B</span>
        <span className="text-muted">→ direction of travel (c)</span>
      </div>
    </div>
  );
}
