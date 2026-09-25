// scripts/generate-pool-manifest.mjs
import { readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const poolsDir = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../public/pools",
);
const files = readdirSync(poolsDir)
  .filter((f) => f.endsWith(".json") && f !== "manifest.json")
  .sort();

writeFileSync(
  path.join(poolsDir, "manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2) +
    "\n",
);

console.log(`Generated pools/manifest.json with ${files.length} pool file(s).`);
