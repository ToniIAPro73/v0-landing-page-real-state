import { mkdirSync, existsSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const ROOT = process.cwd();
const targetDir = join(ROOT, "node_modules");
const targetFile = join(targetDir, "tsconfig.json");

if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

if (!existsSync(targetFile)) {
  const relative = "../tsconfig.json";
  const payload = JSON.stringify({ extends: relative }, null, 2) + "\n";
  writeFileSync(targetFile, payload, "utf8");
  console.log(`[postinstall] Created ${targetFile}`);
}
