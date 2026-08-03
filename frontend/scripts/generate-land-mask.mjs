/**
 * Generates src/components/landing/globe/land-mask.ts — a 360×180 (1°)
 * land/water bitmask rasterized from Natural Earth data (world-atlas).
 * Run once (or after changing resolution): node scripts/generate-land-mask.mjs
 *
 * This keeps runtime asset-free: the globe ships an ~11KB base64 string
 * instead of a 100KB+ TopoJSON or an image texture.
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const require = createRequire(import.meta.url);
const topology = require("world-atlas/land-110m.json");

const WIDTH = 360;
const HEIGHT = 180;

const land = feature(topology, topology.objects.land);

const bytes = new Uint8Array(Math.ceil((WIDTH * HEIGHT) / 8));
let landCells = 0;

console.time("rasterize");
for (let y = 0; y < HEIGHT; y++) {
  const lat = 90 - (y + 0.5);
  for (let x = 0; x < WIDTH; x++) {
    const lon = -180 + (x + 0.5);
    if (geoContains(land, [lon, lat])) {
      const index = y * WIDTH + x;
      bytes[index >> 3] |= 1 << (index & 7);
      landCells += 1;
    }
  }
}
console.timeEnd("rasterize");
console.log(
  `land cells: ${landCells}/${WIDTH * HEIGHT} (${((landCells / (WIDTH * HEIGHT)) * 100).toFixed(1)}%)`,
);

const base64 = Buffer.from(bytes).toString("base64");

const output = `// GENERATED FILE — do not edit by hand.
// Rebuild with: node scripts/generate-land-mask.mjs
// 1°-per-cell land/water bitmask rasterized from world-atlas land-110m
// (Natural Earth). Row 0 is the north edge; bit set = land.

export const LAND_MASK_WIDTH = ${WIDTH};
export const LAND_MASK_HEIGHT = ${HEIGHT};

const LAND_MASK_BASE64 =
  "${base64.match(/.{1,76}/g).join('" +\n  "')}";

let bits: Uint8Array | null = null;

function decode(): Uint8Array {
  if (!bits) {
    const binary = atob(LAND_MASK_BASE64);
    bits = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bits[i] = binary.charCodeAt(i);
  }
  return bits;
}

/** True when the given coordinate falls on land. */
export function isLand(lat: number, lon: number): boolean {
  const x = Math.min(
    LAND_MASK_WIDTH - 1,
    Math.max(0, Math.floor(((lon + 540) % 360 / 360) * LAND_MASK_WIDTH)),
  );
  const y = Math.min(
    LAND_MASK_HEIGHT - 1,
    Math.max(0, Math.floor(((90 - lat) / 180) * LAND_MASK_HEIGHT)),
  );
  const index = y * LAND_MASK_WIDTH + x;
  return (decode()[index >> 3] & (1 << (index & 7))) !== 0;
}
`;

writeFileSync(
  new URL("../src/components/landing/globe/land-mask.ts", import.meta.url),
  output,
);
console.log("wrote src/components/landing/globe/land-mask.ts");
