import { Grid, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  CoefficientCombineRule,
  CuboidCollider,
  CylinderCollider,
  Physics,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { memo, useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { playThud, unlockAudio } from "./audio";
import { scene } from "./palette";
import { useYard, type YardBody } from "./store";

const STEP = 1 / 60;
const BODY_FRICTION = 0.9;
const STAGE_FRICTION = 1.25;

type Registry = Map<number, RapierRigidBody>;

const _ray = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const _hit = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _inv = new THREE.Quaternion();
const _delta = new THREE.Vector3();
const _worldOff = new THREE.Vector3();
const _grab = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _impulse = { x: 0, y: 0, z: 0 };
const _point = { x: 0, y: 0, z: 0 };
const _angvel = { x: 0, y: 0, z: 0 };

type DragState = {
  id: number;
  body: RapierRigidBody;
  plane: THREE.Plane;
  local: THREE.Vector3;
};

function useBoardTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#3c342c";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 90; i += 1) {
      const y = (i / 90) * 512 + Math.random() * 2;
      ctx.strokeStyle = `rgba(20, 14, 10, ${0.05 + (i % 5) * 0.015})`;
      ctx.lineWidth = i % 7 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(160, y + 4, 340, y - 3, 512, y + 1);
      ctx.stroke();
    }
    ctx.strokeStyle = "#d4a054";
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 440, 440);
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, 408, 408);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  }, []);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  return texture;
}

function Lights() {
  return (
    <>
      <hemisphereLight args={[scene.hemiSky, scene.hemiGround, 0.55]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[7, 12, 5]}
        intensity={2.35}
        color={scene.key}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={2}
        shadow-camera-far={28}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.00018}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.45} color={scene.fill} />
    </>
  );
}

function Stage() {
  const board = useBoardTexture();
  return (
    <RigidBody type="fixed" colliders={false} position={[0, 0, 0]} friction={STAGE_FRICTION}>
      <CuboidCollider args={[2.15, 0.36, 2.15]} position={[0, 0.36, 0]} friction={STAGE_FRICTION} />
      <CuboidCollider args={[3.25, 0.07, 3.25]} position={[0, 0.78, 0]} friction={STAGE_FRICTION} />
      <CuboidCollider args={[16, 0.3, 16]} position={[0, -1.85, 0]} friction={STAGE_FRICTION} />
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow raycast={() => null}>
        <boxGeometry args={[4.3, 0.72, 4.3]} />
        <meshStandardMaterial color={scene.pedestal} roughness={0.86} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 0.14, 6.5]} />
        <meshStandardMaterial
          map={board}
          color={scene.board}
          roughness={0.62}
          metalness={0.08}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.54, 0]} receiveShadow raycast={() => null}>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial color={scene.floor} roughness={0.95} metalness={0} />
      </mesh>
    </RigidBody>
  );
}

function MaterialSync() {
  const restitution = useYard((state) => state.restitution);
  const { world } = useRapier();

  useEffect(() => {
    world.forEachCollider((collider) => {
      collider.setRestitution(restitution);
      collider.setRestitutionCombineRule(CoefficientCombineRule.Max);
    });
    world.forEachRigidBody((body) => {
      if (body.isDynamic()) body.wakeUp();
    });
  }, [restitution, world]);

  return null;
}

const DynamicShape = memo(function DynamicShape({
  spec,
  registry,
}: {
  spec: YardBody;
  registry: MutableRefObject<Registry>;
}) {
  const ref = useRef<RapierRigidBody>(null);
  const bounce = useRef(useYard.getState().restitution);

  useEffect(() => {
    const body = ref.current;
    if (!body) return;
    const map = registry.current;
    map.set(spec.id, body);
    return () => {
      map.delete(spec.id);
    };
  }, [registry, spec.id]);

  const color =
    spec.kind === "sphere"
      ? scene.sphere[spec.tint]
      : spec.kind === "box"
        ? scene.box[spec.tint]
        : scene.cylinder[spec.tint];

  return (
    <RigidBody
      ref={ref}
      position={spec.position}
      rotation={spec.rotation}
      colliders={false}
      ccd
      canSleep
      linearDamping={0.12}
      angularDamping={0.18}
      friction={BODY_FRICTION}
      restitution={bounce.current}
      restitutionCombineRule={CoefficientCombineRule.Max}
      additionalSolverIterations={4}
      onCollisionEnter={({ target, other }) => {
        if (!useYard.getState().sound) return;
        const mine = target.rigidBody;
        const theirs = other.rigidBody;
        if (!mine || !theirs) return;
        const a = mine.linvel();
        const b = theirs.linvel();
        const rel = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
        if (rel < 1.35) return;
        playThud(rel);
      }}
    >
      {spec.kind === "sphere" ? <BallCollider args={[spec.half[0]]} /> : null}
      {spec.kind === "box" ? <CuboidCollider args={spec.half} /> : null}
      {spec.kind === "cylinder" ? <CylinderCollider args={[spec.half[1], spec.half[0]]} /> : null}
      <mesh castShadow receiveShadow userData={{ draggable: true, bodyId: spec.id }}>
        {spec.kind === "sphere" ? <sphereGeometry args={[spec.half[0], 28, 20]} /> : null}
        {spec.kind === "box" ? (
          <boxGeometry args={[spec.half[0] * 2, spec.half[1] * 2, spec.half[2] * 2]} />
        ) : null}
        {spec.kind === "cylinder" ? (
          <cylinderGeometry args={[spec.half[0], spec.half[0], spec.half[1] * 2, 24]} />
        ) : null}
        <meshStandardMaterial
          color={color}
          roughness={spec.kind === "sphere" ? 0.32 : spec.kind === "box" ? 0.68 : 0.48}
          metalness={spec.kind === "sphere" ? 0.22 : 0.06}
        />
      </mesh>
    </RigidBody>
  );
});

function DragController({
  registry,
  orbitRef,
}: {
  registry: MutableRefObject<Registry>;
  orbitRef: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera, gl, scene: threeScene } = useThree();
  const drag = useRef<DragState | null>(null);

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";

    const end = () => {
      if (!drag.current) return;
      drag.current = null;
      if (orbitRef.current) orbitRef.current.enabled = true;
      document.body.style.cursor = "";
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const rect = el.getBoundingClientRect();
      _ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      _ray.setFromCamera(_ndc, camera);
      const hits = _ray.intersectObjects(threeScene.children, true);
      const hit = hits[0];
      const data = hit?.object.userData as { draggable?: boolean; bodyId?: number } | undefined;
      if (!hit || !data?.draggable || data.bodyId == null) return;
      const body = registry.current.get(data.bodyId);
      if (!body || !body.isValid()) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      unlockAudio();

      const translation = body.translation();
      const rotation = body.rotation();
      _quat.set(rotation.x, rotation.y, rotation.z, rotation.w);
      _inv.copy(_quat).invert();
      _delta.set(hit.point.x - translation.x, hit.point.y - translation.y, hit.point.z - translation.z);
      const local = _delta.applyQuaternion(_inv).clone();
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(new THREE.Vector3()),
        hit.point,
      );
      drag.current = { id: data.bodyId, body, plane, local };
      if (orbitRef.current) orbitRef.current.enabled = false;
      document.body.style.cursor = "grabbing";
      body.wakeUp();
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      _ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    el.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      end();
    };
  }, [camera, gl, orbitRef, registry, threeScene]);

  useBeforePhysicsStep(() => {
    const current = drag.current;
    if (!current) return;
    const { body } = current;
    if (!body.isValid() || !registry.current.has(current.id)) {
      drag.current = null;
      if (orbitRef.current) orbitRef.current.enabled = true;
      document.body.style.cursor = "";
      return;
    }

    _ray.setFromCamera(_ndc, camera);
    if (!_ray.ray.intersectPlane(current.plane, _hit)) return;

    const translation = body.translation();
    const rotation = body.rotation();
    _quat.set(rotation.x, rotation.y, rotation.z, rotation.w);
    _worldOff.copy(current.local).applyQuaternion(_quat);
    _grab.set(translation.x + _worldOff.x, translation.y + _worldOff.y, translation.z + _worldOff.z);
    _desired.copy(_hit);

    let ex = _desired.x - _grab.x;
    let ey = _desired.y - _grab.y;
    let ez = _desired.z - _grab.z;
    const err = Math.hypot(ex, ey, ez);
    if (err > 2.4) {
      const scale = 2.4 / err;
      ex *= scale;
      ey *= scale;
      ez *= scale;
    }

    const lin = body.linvel();
    const ang = body.angvel();
    const rx = _worldOff.x;
    const ry = _worldOff.y;
    const rz = _worldOff.z;
    const vx = lin.x + (ang.y * rz - ang.z * ry);
    const vy = lin.y + (ang.z * rx - ang.x * rz);
    const vz = lin.z + (ang.x * ry - ang.y * rx);
    const mass = Math.max(body.mass(), 0.05);
    const stiffness = 150;
    const damping = 18;
    _impulse.x = (ex * stiffness - vx * damping) * mass * STEP;
    _impulse.y = (ey * stiffness - vy * damping) * mass * STEP;
    _impulse.z = (ez * stiffness - vz * damping) * mass * STEP;
    const impulseLen = Math.hypot(_impulse.x, _impulse.y, _impulse.z);
    const maxImpulse = mass * 8;
    if (impulseLen > maxImpulse) {
      const scale = maxImpulse / impulseLen;
      _impulse.x *= scale;
      _impulse.y *= scale;
      _impulse.z *= scale;
    }
    _point.x = _grab.x;
    _point.y = _grab.y;
    _point.z = _grab.z;
    body.applyImpulseAtPoint(_impulse, _point, true);

    const speed = Math.hypot(ang.x, ang.y, ang.z);
    if (speed > 12) {
      const scale = 12 / speed;
      _angvel.x = ang.x * scale;
      _angvel.y = ang.y * scale;
      _angvel.z = ang.z * scale;
      body.setAngvel(_angvel, true);
    }
  });

  return null;
}

function CullFar({ registry }: { registry: MutableRefObject<Registry> }) {
  const removeIds = useYard((state) => state.removeIds);
  const pending = useRef<number[]>([]);

  useFrame(() => {
    pending.current.length = 0;
    registry.current.forEach((body, id) => {
      if (!body.isValid()) return;
      const p = body.translation();
      if (p.y < -8 || Math.abs(p.x) > 22 || Math.abs(p.z) > 22) pending.current.push(id);
    });
    if (pending.current.length > 0) removeIds(pending.current.slice());
  });

  return null;
}

function Reframe() {
  const token = useYard((state) => state.reframe);
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;

  useEffect(() => {
    if (token === 0) return;
    camera.position.set(7.1, 5.15, 7.5);
    if (controls && "target" in controls) {
      controls.target.set(0, 0.85, 0);
      controls.update();
    }
  }, [token, camera, controls]);

  return null;
}

function HoverCursor() {
  const { gl, camera, scene: threeScene } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const onMove = (event: PointerEvent) => {
      if (document.body.style.cursor === "grabbing") return;
      const rect = el.getBoundingClientRect();
      _ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      _ray.setFromCamera(_ndc, camera);
      const hit = _ray.intersectObjects(threeScene.children, true)[0];
      const draggable = Boolean(hit?.object.userData?.draggable);
      document.body.style.cursor = draggable ? "grab" : "";
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      document.body.style.cursor = "";
    };
  }, [camera, gl, threeScene]);

  return null;
}

export function Scene() {
  const bodies = useYard((state) => state.bodies);
  const gravity = useYard((state) => state.gravity);
  const registry = useRef<Registry>(new Map());
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const gravityVec = useMemo<[number, number, number]>(() => [0, -gravity, 0], [gravity]);

  return (
    <>
      <color attach="background" args={[scene.sky]} />
      <fog attach="fog" args={[scene.fog, 18, 36]} />
      <Lights />
      <Physics
        gravity={gravityVec}
        timeStep={STEP}
        interpolate
        colliders={false}
        numSolverIterations={8}
        numInternalPgsIterations={2}
        maxCcdSubsteps={2}
      >
        <Stage />
        <MaterialSync />
        {bodies.map((body) => (
          <DynamicShape key={body.id} spec={body} registry={registry} />
        ))}
        <DragController registry={registry} orbitRef={orbitRef} />
        <CullFar registry={registry} />
      </Physics>
      <Grid
        position={[0, -1.53, 0]}
        args={[40, 40]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor={scene.gridCell}
        sectionSize={2.5}
        sectionThickness={1.1}
        sectionColor={scene.gridSection}
        fadeDistance={26}
        fadeStrength={1.5}
        infiniteGrid
        raycast={() => null}
      />
      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableDamping
        dampingFactor={0.12}
        minDistance={4}
        maxDistance={18}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 0.85, 0]}
        enablePan
      />
      <Reframe />
      <HoverCursor />
    </>
  );
}
