import { create } from "zustand";

export type Kind = "sphere" | "box" | "cylinder";

export type YardBody = {
  id: number;
  kind: Kind;
  position: [number, number, number];
  rotation: [number, number, number];
  /** Sphere: radius in x. Box: half extents. Cylinder: radius, halfHeight, unused. */
  half: [number, number, number];
  tint: 0 | 1 | 2;
};

type Persisted = {
  version: 1;
  gravity: number;
  restitution: number;
  sound: boolean;
};

const STORAGE_KEY = "mass-yard-v1";
const MAX_BODIES = 42;

let seq = 1;

function nextId() {
  seq += 1;
  return seq;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadSettings(): Persisted {
  const fallback: Persisted = { version: 1, gravity: 9.81, restitution: 0.35, sound: true };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (parsed.version !== 1) return fallback;
    return {
      version: 1,
      gravity: clamp(typeof parsed.gravity === "number" ? parsed.gravity : fallback.gravity, 0, 30),
      restitution: clamp(
        typeof parsed.restitution === "number" ? parsed.restitution : fallback.restitution,
        0,
        1,
      ),
      sound: parsed.sound !== false,
    };
  } catch {
    return fallback;
  }
}

function saveSettings(settings: Persisted) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function rollTint(): 0 | 1 | 2 {
  return Math.floor(Math.random() * 3) as 0 | 1 | 2;
}

function makeBody(kind: Kind, position?: [number, number, number]): YardBody {
  const pos = position ?? [
    (Math.random() - 0.5) * 2.2,
    3.2 + Math.random() * 1.4,
    (Math.random() - 0.5) * 2.2,
  ];
  const rotation: [number, number, number] = [
    (Math.random() - 0.5) * 0.6,
    Math.random() * Math.PI,
    (Math.random() - 0.5) * 0.6,
  ];
  if (kind === "sphere") {
    const radius = 0.28 + Math.random() * 0.2;
    return { id: nextId(), kind, position: pos, rotation, half: [radius, radius, radius], tint: rollTint() };
  }
  if (kind === "box") {
    const base = 0.26 + Math.random() * 0.18;
    return {
      id: nextId(),
      kind,
      position: pos,
      rotation,
      half: [
        base * (0.85 + Math.random() * 0.35),
        base * (0.7 + Math.random() * 0.4),
        base * (0.85 + Math.random() * 0.35),
      ],
      tint: rollTint(),
    };
  }
  const radius = 0.2 + Math.random() * 0.16;
  const halfHeight = 0.28 + Math.random() * 0.26;
  return {
    id: nextId(),
    kind,
    position: pos,
    rotation,
    half: [radius, halfHeight, radius],
    tint: rollTint(),
  };
}

function fixedBody(
  kind: Kind,
  position: [number, number, number],
  half: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  tint: 0 | 1 | 2 = 1,
): YardBody {
  return { id: nextId(), kind, position, rotation, half, tint };
}

function openingPile(): YardBody[] {
  return [
    fixedBody("box", [0, 2.15, 0], [0.46, 0.32, 0.46], [0, 0.2, 0], 1),
    fixedBody("box", [0.06, 3.15, -0.04], [0.36, 0.28, 0.36], [0.04, 0.4, 0], 0),
    fixedBody("box", [-0.05, 4.1, 0.05], [0.3, 0.26, 0.32], [0, 0.1, 0.05], 2),
    fixedBody("cylinder", [0.9, 3.5, 0.55], [0.24, 0.4, 0.24], [0.15, 0.4, 0.1], 1),
    fixedBody("sphere", [-0.85, 3.7, -0.4], [0.36, 0.36, 0.36], [0, 0, 0], 0),
    fixedBody("sphere", [0.15, 5.15, 0.12], [0.28, 0.28, 0.28], [0, 0, 0], 2),
    fixedBody("cylinder", [-0.4, 5.7, 0.45], [0.2, 0.32, 0.2], [0.4, 0.2, 0.2], 0),
  ];
}

function trim(bodies: YardBody[]) {
  if (bodies.length <= MAX_BODIES) return bodies;
  return bodies.slice(bodies.length - MAX_BODIES);
}

type YardState = {
  bodies: YardBody[];
  gravity: number;
  restitution: number;
  sound: boolean;
  reframe: number;
  spawn: (kind: Kind) => void;
  scatter: () => void;
  clear: () => void;
  setGravity: (value: number) => void;
  setRestitution: (value: number) => void;
  toggleSound: () => void;
  reframeCamera: () => void;
  removeIds: (ids: number[]) => void;
};

const initial = loadSettings();

export const useYard = create<YardState>((set, get) => ({
  bodies: openingPile(),
  gravity: initial.gravity,
  restitution: initial.restitution,
  sound: initial.sound,
  reframe: 0,
  spawn: (kind) => {
    const body = makeBody(kind);
    set((state) => ({ bodies: trim([...state.bodies, body]) }));
  },
  scatter: () => {
    const kinds: Kind[] = ["box", "sphere", "cylinder", "box", "sphere", "cylinder", "box"];
    const adding = kinds.map((kind, index) =>
      makeBody(kind, [
        (Math.random() - 0.5) * 2.4,
        3.1 + index * 0.62,
        (Math.random() - 0.5) * 2.4,
      ]),
    );
    set((state) => ({ bodies: trim([...state.bodies, ...adding]) }));
  },
  clear: () => set({ bodies: [] }),
  setGravity: (value) => {
    const gravity = clamp(value, 0, 30);
    const { restitution, sound } = get();
    saveSettings({ version: 1, gravity, restitution, sound });
    set({ gravity });
  },
  setRestitution: (value) => {
    const restitution = clamp(value, 0, 1);
    const { gravity, sound } = get();
    saveSettings({ version: 1, gravity, restitution, sound });
    set({ restitution });
  },
  toggleSound: () => {
    const sound = !get().sound;
    const { gravity, restitution } = get();
    saveSettings({ version: 1, gravity, restitution, sound });
    set({ sound });
  },
  reframeCamera: () => set((state) => ({ reframe: state.reframe + 1 })),
  removeIds: (ids) => {
    if (ids.length === 0) return;
    const drop = new Set(ids);
    set((state) => ({ bodies: state.bodies.filter((body) => !drop.has(body.id)) }));
  },
}));
