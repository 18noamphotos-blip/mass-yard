export const scene = {
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
  sphere: ["#e2b56a", "#d4a054", "#c48b3c"],
  box: ["#9ab8a2", "#7f9a86", "#5f7d68"],
  cylinder: ["#d48462", "#c46a4a", "#a35238"],
} as const;

export type Tint = 0 | 1 | 2;
