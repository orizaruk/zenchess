// Generates extension/icons/icon.svg: a brush-stroke ensō around a pawn.
//   node tools/gen-icon.js extension/icons/icon.svg
// The PNG sizes are rendered from that SVG (see store/listing.md).
const fs = require("fs");
const out = process.argv[2];
const C = 64, R = 43;
// Stroke sweeps ~320° counter-clockwise, leaving the gap at the lower right.
const a0 = -65, a1 = 258, N = 120, maxW = 13;
const rad = (d) => (d * Math.PI) / 180;
const outer = [], inner = [];
for (let i = 0; i <= N; i++) {
  const u = i / N;
  const a = rad(a0 + (a1 - a0) * u);
  // Heavy where the brush lands, thinning to a dry tail.
  const w = maxW * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.55) * (1 - 0.45 * u) + 1.2;
  const wob = 0.8 * Math.sin(u * 23); // slight hand wobble
  const r = R + wob;
  outer.push([C + (r + w / 2) * Math.cos(a), C - (r + w / 2) * Math.sin(a)]);
  inner.push([C + (r - w / 2) * Math.cos(a), C - (r - w / 2) * Math.sin(a)]);
}
const pts = [...outer, ...inner.reverse()].map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`);
const enso = `M${pts[0]} L${pts.slice(1).join(" L")} Z`;
const ink = "#1d1b19", paper = "#f2ead7";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect x="2" y="2" width="124" height="124" rx="26" fill="${paper}"/>
  <path d="${enso}" fill="${ink}"/>
  <g fill="${ink}">
    <circle cx="64" cy="47" r="10.5"/>
    <rect x="50" y="57" width="28" height="6" rx="3"/>
    <path d="M56.5 62 C56.5 72 51 80 46 86 L82 86 C77 80 71.5 72 71.5 62 Z"/>
    <rect x="42" y="85" width="44" height="9" rx="3.5"/>
  </g>
</svg>
`;
fs.writeFileSync(out, svg);
