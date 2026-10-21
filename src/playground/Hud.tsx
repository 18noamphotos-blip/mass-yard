import { Box, Circle, Cylinder, Layers, LocateFixed, Trash2, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
import { unlockAudio } from "./audio";
import { useYard, type Kind } from "./store";

const SHAPES: { kind: Kind; label: string; short: string; icon: typeof Circle }[] = [
  { kind: "sphere", label: "Sphere", short: "Sphere", icon: Circle },
  { kind: "box", label: "Box", short: "Box", icon: Box },
  { kind: "cylinder", label: "Cylinder", short: "Cyl", icon: Cylinder },
];

const GRAVITY_PRESETS = [
  { label: "Moon", value: 1.62 },
  { label: "Earth", value: 9.81 },
  { label: "Jupiter", value: 24.8 },
];

const BOUNCE_PRESETS = [
  { label: "Dull", value: 0.05 },
  { label: "Firm", value: 0.35 },
  { label: "Live", value: 0.85 },
];

function nearly(a: number, b: number) {
  return Math.abs(a - b) < 0.02;
}

export function Hud() {
  const bodies = useYard((state) => state.bodies.length);
  const gravity = useYard((state) => state.gravity);
  const restitution = useYard((state) => state.restitution);
  const sound = useYard((state) => state.sound);
  const spawn = useYard((state) => state.spawn);
  const scatter = useYard((state) => state.scatter);
  const clear = useYard((state) => state.clear);
  const setGravity = useYard((state) => state.setGravity);
  const setRestitution = useYard((state) => state.setRestitution);
  const toggleSound = useYard((state) => state.toggleSound);
  const reframeCamera = useYard((state) => state.reframeCamera);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "1") spawn("sphere");
      else if (event.key === "2") spawn("box");
      else if (event.key === "3") spawn("cylinder");
      else if (event.key === "m" || event.key === "M") scatter();
      else if (event.key === "c" || event.key === "C") clear();
      else if (event.key === "r" || event.key === "R") reframeCamera();
      else return;
      unlockAudio();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spawn, scatter, clear, reframeCamera]);

  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-1 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="flex min-w-0 items-center gap-2 font-display text-2xl leading-none tracking-tight text-fg sm:text-3xl">
            <span className="size-2.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
            <span className="truncate">Mass Yard</span>
          </h1>
          <div className="pointer-events-auto flex shrink-0 items-center gap-2">
            <p className="rounded-full border border-border bg-surface px-3 py-2 text-sm tabular-nums text-fg">
              {bodies}
              <span className="hidden text-muted sm:inline"> in play</span>
            </p>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-fg"
              onClick={() => {
                unlockAudio();
                toggleSound();
              }}
              aria-label={sound ? "Mute impacts" : "Unmute impacts"}
              aria-pressed={sound}
            >
              {sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </button>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-fg"
              onClick={reframeCamera}
              aria-label="Reframe camera"
            >
              <LocateFixed className="size-5" />
            </button>
          </div>
        </div>
        <p className="text-sm text-muted">Drag a shape. Empty space orbits the table.</p>
        <p className="hidden text-xs text-muted md:block">1 sphere · 2 box · 3 cylinder · M mix · C clear · R reframe</p>
      </header>

      {bodies === 0 ? (
        <p className="pointer-events-none absolute inset-x-0 top-1/3 z-10 px-6 text-center text-sm text-muted">
          The table is clear. Drop a shape to start a pile.
        </p>
      ) : null}

      <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-dock sm:p-4 md:inset-x-auto md:left-1/2 md:w-[40rem] md:-translate-x-1/2">
        <div className="grid grid-cols-5 gap-2">
          {SHAPES.map((shape) => {
            const Icon = shape.icon;
            return (
              <button
                key={shape.kind}
                type="button"
                aria-label={`Drop ${shape.label}`}
                className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-surface-2 text-fg sm:h-14"
                onClick={() => {
                  unlockAudio();
                  spawn(shape.kind);
                }}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="text-xs leading-none sm:hidden">{shape.short}</span>
                <span className="hidden text-xs leading-none sm:inline">{shape.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-brass text-bg sm:h-14"
            onClick={() => {
              unlockAudio();
              scatter();
            }}
          >
            <Layers className="size-5" aria-hidden="true" />
            <span className="text-xs leading-none">Mix</span>
          </button>
          <button
            type="button"
            className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl border border-border text-fg sm:h-14"
            onClick={clear}
          >
            <Trash2 className="size-5" aria-hidden="true" />
            <span className="text-xs leading-none">Clear</span>
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col">
            <span className="flex items-baseline justify-between text-sm">
              <span>Gravity</span>
              <span className="tabular-nums text-muted">{gravity.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={30}
              step={0.1}
              value={gravity}
              aria-label="Gravity"
              onChange={(event) => setGravity(Number(event.target.value))}
            />
            <span className="flex flex-wrap gap-2">
              {GRAVITY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={
                    nearly(gravity, preset.value)
                      ? "rounded-full bg-brass px-2.5 py-1 text-xs text-bg"
                      : "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted"
                  }
                  onClick={() => setGravity(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </span>
          </label>

          <label className="flex flex-col">
            <span className="flex items-baseline justify-between text-sm">
              <span>Bounce</span>
              <span className="tabular-nums text-muted">{restitution.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={restitution}
              aria-label="Bounce"
              onChange={(event) => setRestitution(Number(event.target.value))}
            />
            <span className="flex flex-wrap gap-2">
              {BOUNCE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={
                    nearly(restitution, preset.value)
                      ? "rounded-full bg-brass px-2.5 py-1 text-xs text-bg"
                      : "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted"
                  }
                  onClick={() => setRestitution(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </span>
          </label>
        </div>
      </div>
    </>
  );
}
