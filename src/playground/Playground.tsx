import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { Hud } from "./Hud";
import { scene } from "./palette";
import { Scene } from "./Scene";

export function Playground() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg select-none">
      <Canvas
        className="absolute inset-0 touch-none"
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [7.1, 5.15, 7.5], fov: 40, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(scene.sky);
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <Scene />
      </Canvas>
      <Hud />
    </main>
  );
}
