import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, w as require_react } from "../_libs/@react-three/drei+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bu8pPQYg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [View, setView] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		import("./Playground-B0eWDuzZ.mjs").then((mod) => {
			if (live) setView(() => mod.Playground);
		});
		return () => {
			live = false;
		};
	}, []);
	if (!View) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(View, {});
}
function Boot() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh flex-col items-center justify-center gap-2 bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-3xl tracking-tight",
			children: "Mass Yard"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Setting the table…"
		})]
	});
}
//#endregion
export { Home as component };
