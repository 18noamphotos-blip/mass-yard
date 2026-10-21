import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, S as Vector3, _ as Plane, a as useThree, b as SRGBColorSpace, d as CanvasTexture, i as useFrame, n as OrbitControls, r as Canvas, t as Grid, v as Quaternion, w as require_react, x as Vector2, y as Raycaster } from "../_libs/@react-three/drei+[...].mjs";
import { a as LocateFixed, c as Circle, i as Trash2, l as Box, n as Volume2, o as Layers, s as Cylinder, t as VolumeX } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as RigidBody, i as Physics, n as CuboidCollider, o as useBeforePhysicsStep, r as CylinderCollider, s as useRapier, t as BallCollider } from "../_libs/@react-three/rapier+[...].mjs";
import { t as AI } from "../_libs/dimforge__rapier3d-compat.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Playground-B0eWDuzZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
var lastHit = 0;
function context() {
	if (typeof window === "undefined") return null;
	const AC = window.AudioContext;
	if (!AC) return null;
	if (!ctx) ctx = new AC();
	return ctx;
}
function unlockAudio() {
	const audio = context();
	if (audio && audio.state === "suspended") audio.resume();
}
function playThud(speed) {
	const audio = context();
	if (!audio || audio.state !== "running") return;
	const now = performance.now();
	if (now - lastHit < 42) return;
	lastHit = now;
	const t = audio.currentTime;
	const osc = audio.createOscillator();
	const gain = audio.createGain();
	const filter = audio.createBiquadFilter();
	osc.type = "triangle";
	const start = 70 + Math.random() * 50 + Math.min(speed, 8) * 6;
	osc.frequency.setValueAtTime(start, t);
	osc.frequency.exponentialRampToValueAtTime(36, t + .09);
	filter.type = "lowpass";
	filter.frequency.setValueAtTime(420, t);
	const volume = Math.min(.18, .03 + speed * .012);
	gain.gain.setValueAtTime(volume, t);
	gain.gain.exponentialRampToValueAtTime(1e-4, t + .14);
	osc.connect(filter);
	filter.connect(gain);
	gain.connect(audio.destination);
	osc.start(t);
	osc.stop(t + .15);
}
var STORAGE_KEY = "mass-yard-v1";
var MAX_BODIES = 42;
var seq = 1;
function nextId() {
	seq += 1;
	return seq;
}
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function loadSettings() {
	const fallback = {
		version: 1,
		gravity: 9.81,
		restitution: .35,
		sound: true
	};
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		if (parsed.version !== 1) return fallback;
		return {
			version: 1,
			gravity: clamp(typeof parsed.gravity === "number" ? parsed.gravity : fallback.gravity, 0, 30),
			restitution: clamp(typeof parsed.restitution === "number" ? parsed.restitution : fallback.restitution, 0, 1),
			sound: parsed.sound !== false
		};
	} catch {
		return fallback;
	}
}
function saveSettings(settings) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
function rollTint() {
	return Math.floor(Math.random() * 3);
}
function makeBody(kind, position) {
	const pos = position ?? [
		(Math.random() - .5) * 2.2,
		3.2 + Math.random() * 1.4,
		(Math.random() - .5) * 2.2
	];
	const rotation = [
		(Math.random() - .5) * .6,
		Math.random() * Math.PI,
		(Math.random() - .5) * .6
	];
	if (kind === "sphere") {
		const radius = .28 + Math.random() * .2;
		return {
			id: nextId(),
			kind,
			position: pos,
			rotation,
			half: [
				radius,
				radius,
				radius
			],
			tint: rollTint()
		};
	}
	if (kind === "box") {
		const base = .26 + Math.random() * .18;
		return {
			id: nextId(),
			kind,
			position: pos,
			rotation,
			half: [
				base * (.85 + Math.random() * .35),
				base * (.7 + Math.random() * .4),
				base * (.85 + Math.random() * .35)
			],
			tint: rollTint()
		};
	}
	const radius = .2 + Math.random() * .16;
	const halfHeight = .28 + Math.random() * .26;
	return {
		id: nextId(),
		kind,
		position: pos,
		rotation,
		half: [
			radius,
			halfHeight,
			radius
		],
		tint: rollTint()
	};
}
function fixedBody(kind, position, half, rotation = [
	0,
	0,
	0
], tint = 1) {
	return {
		id: nextId(),
		kind,
		position,
		rotation,
		half,
		tint
	};
}
function openingPile() {
	return [
		fixedBody("box", [
			0,
			2.15,
			0
		], [
			.46,
			.32,
			.46
		], [
			0,
			.2,
			0
		], 1),
		fixedBody("box", [
			.06,
			3.15,
			-.04
		], [
			.36,
			.28,
			.36
		], [
			.04,
			.4,
			0
		], 0),
		fixedBody("box", [
			-.05,
			4.1,
			.05
		], [
			.3,
			.26,
			.32
		], [
			0,
			.1,
			.05
		], 2),
		fixedBody("cylinder", [
			.9,
			3.5,
			.55
		], [
			.24,
			.4,
			.24
		], [
			.15,
			.4,
			.1
		], 1),
		fixedBody("sphere", [
			-.85,
			3.7,
			-.4
		], [
			.36,
			.36,
			.36
		], [
			0,
			0,
			0
		], 0),
		fixedBody("sphere", [
			.15,
			5.15,
			.12
		], [
			.28,
			.28,
			.28
		], [
			0,
			0,
			0
		], 2),
		fixedBody("cylinder", [
			-.4,
			5.7,
			.45
		], [
			.2,
			.32,
			.2
		], [
			.4,
			.2,
			.2
		], 0)
	];
}
function trim(bodies) {
	if (bodies.length <= MAX_BODIES) return bodies;
	return bodies.slice(bodies.length - MAX_BODIES);
}
var initial = loadSettings();
var useYard = create((set, get) => ({
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
		const adding = [
			"box",
			"sphere",
			"cylinder",
			"box",
			"sphere",
			"cylinder",
			"box"
		].map((kind, index) => makeBody(kind, [
			(Math.random() - .5) * 2.4,
			3.1 + index * .62,
			(Math.random() - .5) * 2.4
		]));
		set((state) => ({ bodies: trim([...state.bodies, ...adding]) }));
	},
	clear: () => set({ bodies: [] }),
	setGravity: (value) => {
		const gravity = clamp(value, 0, 30);
		const { restitution, sound } = get();
		saveSettings({
			version: 1,
			gravity,
			restitution,
			sound
		});
		set({ gravity });
	},
	setRestitution: (value) => {
		const restitution = clamp(value, 0, 1);
		const { gravity, sound } = get();
		saveSettings({
			version: 1,
			gravity,
			restitution,
			sound
		});
		set({ restitution });
	},
	toggleSound: () => {
		const sound = !get().sound;
		const { gravity, restitution } = get();
		saveSettings({
			version: 1,
			gravity,
			restitution,
			sound
		});
		set({ sound });
	},
	reframeCamera: () => set((state) => ({ reframe: state.reframe + 1 })),
	removeIds: (ids) => {
		if (ids.length === 0) return;
		const drop = new Set(ids);
		set((state) => ({ bodies: state.bodies.filter((body) => !drop.has(body.id)) }));
	}
}));
var SHAPES = [
	{
		kind: "sphere",
		label: "Sphere",
		short: "Sphere",
		icon: Circle
	},
	{
		kind: "box",
		label: "Box",
		short: "Box",
		icon: Box
	},
	{
		kind: "cylinder",
		label: "Cylinder",
		short: "Cyl",
		icon: Cylinder
	}
];
var GRAVITY_PRESETS = [
	{
		label: "Moon",
		value: 1.62
	},
	{
		label: "Earth",
		value: 9.81
	},
	{
		label: "Jupiter",
		value: 24.8
	}
];
var BOUNCE_PRESETS = [
	{
		label: "Dull",
		value: .05
	},
	{
		label: "Firm",
		value: .35
	},
	{
		label: "Live",
		value: .85
	}
];
function nearly(a, b) {
	return Math.abs(a - b) < .02;
}
function Hud() {
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
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
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
	}, [
		spawn,
		scatter,
		clear,
		reframeCamera
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-1 p-3 sm:p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "flex min-w-0 items-center gap-2 font-display text-2xl leading-none tracking-tight text-fg sm:text-3xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 shrink-0 rounded-full bg-brass",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: "Mass Yard"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto flex shrink-0 items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded-full border border-border bg-surface px-3 py-2 text-sm tabular-nums text-fg",
								children: [bodies, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-muted sm:inline",
									children: " in play"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex size-11 items-center justify-center rounded-full border border-border bg-surface text-fg",
								onClick: () => {
									unlockAudio();
									toggleSound();
								},
								"aria-label": sound ? "Mute impacts" : "Unmute impacts",
								"aria-pressed": sound,
								children: sound ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex size-11 items-center justify-center rounded-full border border-border bg-surface text-fg",
								onClick: reframeCamera,
								"aria-label": "Reframe camera",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-5" })
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Drag a shape. Empty space orbits the table."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden text-xs text-muted md:block",
					children: "1 sphere · 2 box · 3 cylinder · M mix · C clear · R reframe"
				})
			]
		}),
		bodies === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "pointer-events-none absolute inset-x-0 top-1/3 z-10 px-6 text-center text-sm text-muted",
			children: "The table is clear. Drop a shape to start a pile."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto absolute inset-x-3 bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-dock sm:p-4 md:inset-x-auto md:left-1/2 md:w-[40rem] md:-translate-x-1/2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-5 gap-2",
				children: [
					SHAPES.map((shape) => {
						const Icon = shape.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-label": `Drop ${shape.label}`,
							className: "flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-surface-2 text-fg sm:h-14",
							onClick: () => {
								unlockAudio();
								spawn(shape.kind);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs leading-none sm:hidden",
									children: shape.short
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden text-xs leading-none sm:inline",
									children: shape.label
								})
							]
						}, shape.kind);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-brass text-bg sm:h-14",
						onClick: () => {
							unlockAudio();
							scatter();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
							className: "size-5",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs leading-none",
							children: "Mix"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl border border-border text-fg sm:h-14",
						onClick: clear,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
							className: "size-5",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs leading-none",
							children: "Clear"
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-baseline justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gravity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-muted",
								children: gravity.toFixed(1)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 30,
							step: .1,
							value: gravity,
							"aria-label": "Gravity",
							onChange: (event) => setGravity(Number(event.target.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex flex-wrap gap-2",
							children: GRAVITY_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: nearly(gravity, preset.value) ? "rounded-full bg-brass px-2.5 py-1 text-xs text-bg" : "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted",
								onClick: () => setGravity(preset.value),
								children: preset.label
							}, preset.label))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-baseline justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bounce" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-muted",
								children: restitution.toFixed(2)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 1,
							step: .01,
							value: restitution,
							"aria-label": "Bounce",
							onChange: (event) => setRestitution(Number(event.target.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex flex-wrap gap-2",
							children: BOUNCE_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: nearly(restitution, preset.value) ? "rounded-full bg-brass px-2.5 py-1 text-xs text-bg" : "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted",
								onClick: () => setRestitution(preset.value),
								children: preset.label
							}, preset.label))
						})
					]
				})]
			})]
		})
	] });
}
var scene = {
	sky: "#121614",
	fog: "#121614",
	hemiSky: "#e7efe8",
	hemiGround: "#2a241c",
	key: "#fff4e4",
	fill: "#9eb4c0",
	board: "#ffffff",
	pedestal: "#1a221e",
	floor: "#161c19",
	gridCell: "#24302b",
	gridSection: "#3a4a42",
	sphere: [
		"#e2b56a",
		"#d4a054",
		"#c48b3c"
	],
	box: [
		"#9ab8a2",
		"#7f9a86",
		"#5f7d68"
	],
	cylinder: [
		"#d48462",
		"#c46a4a",
		"#a35238"
	]
};
var STEP = 1 / 60;
var BODY_FRICTION = .9;
var STAGE_FRICTION = 1.25;
var _ray = new Raycaster();
var _ndc = new Vector2();
var _hit = new Vector3();
var _quat = new Quaternion();
var _inv = new Quaternion();
var _delta = new Vector3();
var _worldOff = new Vector3();
var _grab = new Vector3();
var _desired = new Vector3();
var _impulse = {
	x: 0,
	y: 0,
	z: 0
};
var _point = {
	x: 0,
	y: 0,
	z: 0
};
var _angvel = {
	x: 0,
	y: 0,
	z: 0
};
function useBoardTexture() {
	const texture = (0, import_react.useMemo)(() => {
		const canvas = document.createElement("canvas");
		canvas.width = 512;
		canvas.height = 512;
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;
		ctx.fillStyle = "#3c342c";
		ctx.fillRect(0, 0, 512, 512);
		for (let i = 0; i < 90; i += 1) {
			const y = i / 90 * 512 + Math.random() * 2;
			ctx.strokeStyle = `rgba(20, 14, 10, ${.05 + i % 5 * .015})`;
			ctx.lineWidth = i % 7 === 0 ? 2 : 1;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.bezierCurveTo(160, y + 4, 340, y - 3, 512, y + 1);
			ctx.stroke();
		}
		ctx.strokeStyle = "#d4a054";
		ctx.globalAlpha = .7;
		ctx.lineWidth = 6;
		ctx.strokeRect(36, 36, 440, 440);
		ctx.globalAlpha = .35;
		ctx.lineWidth = 2;
		ctx.strokeRect(52, 52, 408, 408);
		const map = new CanvasTexture(canvas);
		map.colorSpace = SRGBColorSpace;
		map.anisotropy = 8;
		return map;
	}, []);
	(0, import_react.useEffect)(() => {
		return () => texture?.dispose();
	}, [texture]);
	return texture;
}
function Lights() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
			scene.hemiSky,
			scene.hemiGround,
			.55
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .28 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				7,
				12,
				5
			],
			intensity: 2.35,
			color: scene.key,
			castShadow: true,
			"shadow-mapSize-width": 2048,
			"shadow-mapSize-height": 2048,
			"shadow-camera-near": 2,
			"shadow-camera-far": 28,
			"shadow-camera-left": -8,
			"shadow-camera-right": 8,
			"shadow-camera-top": 8,
			"shadow-camera-bottom": -8,
			"shadow-bias": -18e-5,
			"shadow-normalBias": .03
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-6,
				4,
				-4
			],
			intensity: .45,
			color: scene.fill
		})
	] });
}
function Stage() {
	const board = useBoardTexture();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RigidBody, {
		type: "fixed",
		colliders: false,
		position: [
			0,
			0,
			0
		],
		friction: STAGE_FRICTION,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, {
				args: [
					2.15,
					.36,
					2.15
				],
				position: [
					0,
					.36,
					0
				],
				friction: STAGE_FRICTION
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, {
				args: [
					3.25,
					.07,
					3.25
				],
				position: [
					0,
					.78,
					0
				],
				friction: STAGE_FRICTION
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, {
				args: [
					16,
					.3,
					16
				],
				position: [
					0,
					-1.85,
					0
				],
				friction: STAGE_FRICTION
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.36,
					0
				],
				castShadow: true,
				receiveShadow: true,
				raycast: () => null,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					4.3,
					.72,
					4.3
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: scene.pedestal,
					roughness: .86,
					metalness: .04
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.78,
					0
				],
				castShadow: true,
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					6.5,
					.14,
					6.5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					map: board,
					color: scene.board,
					roughness: .62,
					metalness: .08
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				position: [
					0,
					-1.54,
					0
				],
				receiveShadow: true,
				raycast: () => null,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [48, 48] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: scene.floor,
					roughness: .95,
					metalness: 0
				})]
			})
		]
	});
}
function MaterialSync() {
	const restitution = useYard((state) => state.restitution);
	const { world } = useRapier();
	(0, import_react.useEffect)(() => {
		world.forEachCollider((collider) => {
			collider.setRestitution(restitution);
			collider.setRestitutionCombineRule(AI.Max);
		});
		world.forEachRigidBody((body) => {
			if (body.isDynamic()) body.wakeUp();
		});
	}, [restitution, world]);
	return null;
}
var DynamicShape = (0, import_react.memo)(function DynamicShape({ spec, registry }) {
	const ref = (0, import_react.useRef)(null);
	const bounce = (0, import_react.useRef)(useYard.getState().restitution);
	(0, import_react.useEffect)(() => {
		const body = ref.current;
		if (!body) return;
		const map = registry.current;
		map.set(spec.id, body);
		return () => {
			map.delete(spec.id);
		};
	}, [registry, spec.id]);
	const color = spec.kind === "sphere" ? scene.sphere[spec.tint] : spec.kind === "box" ? scene.box[spec.tint] : scene.cylinder[spec.tint];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RigidBody, {
		ref,
		position: spec.position,
		rotation: spec.rotation,
		colliders: false,
		ccd: true,
		canSleep: true,
		linearDamping: .12,
		angularDamping: .18,
		friction: BODY_FRICTION,
		restitution: bounce.current,
		restitutionCombineRule: AI.Max,
		additionalSolverIterations: 4,
		onCollisionEnter: ({ target, other }) => {
			if (!useYard.getState().sound) return;
			const mine = target.rigidBody;
			const theirs = other.rigidBody;
			if (!mine || !theirs) return;
			const a = mine.linvel();
			const b = theirs.linvel();
			const rel = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
			if (rel < 1.35) return;
			playThud(rel);
		},
		children: [
			spec.kind === "sphere" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BallCollider, { args: [spec.half[0]] }) : null,
			spec.kind === "box" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuboidCollider, { args: spec.half }) : null,
			spec.kind === "cylinder" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CylinderCollider, { args: [spec.half[1], spec.half[0]] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				castShadow: true,
				receiveShadow: true,
				userData: {
					draggable: true,
					bodyId: spec.id
				},
				children: [
					spec.kind === "sphere" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
						spec.half[0],
						28,
						20
					] }) : null,
					spec.kind === "box" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						spec.half[0] * 2,
						spec.half[1] * 2,
						spec.half[2] * 2
					] }) : null,
					spec.kind === "cylinder" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						spec.half[0],
						spec.half[0],
						spec.half[1] * 2,
						24
					] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color,
						roughness: spec.kind === "sphere" ? .32 : spec.kind === "box" ? .68 : .48,
						metalness: spec.kind === "sphere" ? .22 : .06
					})
				]
			})
		]
	});
});
function DragController({ registry, orbitRef }) {
	const { camera, gl, scene: threeScene } = useThree();
	const drag = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = gl.domElement;
		el.style.touchAction = "none";
		const end = () => {
			if (!drag.current) return;
			drag.current = null;
			if (orbitRef.current) orbitRef.current.enabled = true;
			document.body.style.cursor = "";
		};
		const onDown = (event) => {
			if (event.button !== 0) return;
			const rect = el.getBoundingClientRect();
			_ndc.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			_ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			_ray.setFromCamera(_ndc, camera);
			const hit = _ray.intersectObjects(threeScene.children, true)[0];
			const data = hit?.object.userData;
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
			const plane = new Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new Vector3()), hit.point);
			drag.current = {
				id: data.bodyId,
				body,
				plane,
				local
			};
			if (orbitRef.current) orbitRef.current.enabled = false;
			document.body.style.cursor = "grabbing";
			body.wakeUp();
		};
		const onMove = (event) => {
			const rect = el.getBoundingClientRect();
			_ndc.x = (event.clientX - rect.left) / rect.width * 2 - 1;
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
	}, [
		camera,
		gl,
		orbitRef,
		registry,
		threeScene
	]);
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
		const mass = Math.max(body.mass(), .05);
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
function CullFar({ registry }) {
	const removeIds = useYard((state) => state.removeIds);
	const pending = (0, import_react.useRef)([]);
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
	const controls = useThree((state) => state.controls);
	(0, import_react.useEffect)(() => {
		if (token === 0) return;
		camera.position.set(7.1, 5.15, 7.5);
		if (controls && "target" in controls) {
			controls.target.set(0, .85, 0);
			controls.update();
		}
	}, [
		token,
		camera,
		controls
	]);
	return null;
}
function HoverCursor() {
	const { gl, camera, scene: threeScene } = useThree();
	(0, import_react.useEffect)(() => {
		const el = gl.domElement;
		const onMove = (event) => {
			if (document.body.style.cursor === "grabbing") return;
			const rect = el.getBoundingClientRect();
			_ndc.x = (event.clientX - rect.left) / rect.width * 2 - 1;
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
	}, [
		camera,
		gl,
		threeScene
	]);
	return null;
}
function Scene() {
	const bodies = useYard((state) => state.bodies);
	const gravity = useYard((state) => state.gravity);
	const registry = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const orbitRef = (0, import_react.useRef)(null);
	const gravityVec = (0, import_react.useMemo)(() => [
		0,
		-gravity,
		0
	], [gravity]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: [scene.sky]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				scene.fog,
				18,
				36
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lights, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Physics, {
			gravity: gravityVec,
			timeStep: STEP,
			interpolate: true,
			colliders: false,
			numSolverIterations: 8,
			numInternalPgsIterations: 2,
			maxCcdSubsteps: 2,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaterialSync, {}),
				bodies.map((body) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicShape, {
					spec: body,
					registry
				}, body.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragController, {
					registry,
					orbitRef
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CullFar, { registry })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
			position: [
				0,
				-1.53,
				0
			],
			args: [40, 40],
			cellSize: .5,
			cellThickness: .6,
			cellColor: scene.gridCell,
			sectionSize: 2.5,
			sectionThickness: 1.1,
			sectionColor: scene.gridSection,
			fadeDistance: 26,
			fadeStrength: 1.5,
			infiniteGrid: true,
			raycast: () => null
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
			ref: orbitRef,
			makeDefault: true,
			enableDamping: true,
			dampingFactor: .12,
			minDistance: 4,
			maxDistance: 18,
			minPolarAngle: .18,
			maxPolarAngle: Math.PI / 2.08,
			target: [
				0,
				.85,
				0
			],
			enablePan: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reframe, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCursor, {})
	] });
}
function Playground() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg select-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
			className: "absolute inset-0 touch-none",
			shadows: true,
			dpr: [1, 1.6],
			camera: {
				position: [
					7.1,
					5.15,
					7.5
				],
				fov: 40,
				near: .1,
				far: 80
			},
			gl: {
				antialias: true,
				alpha: false,
				powerPreference: "high-performance"
			},
			onCreated: ({ gl }) => {
				gl.setClearColor(scene.sky);
				gl.toneMapping = 4;
				gl.toneMappingExposure = 1.08;
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {})]
	});
}
//#endregion
export { Playground };
