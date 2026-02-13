/**
 * Ejecuta `prisma generate` con reintentos para evitar EPERM en Windows
 * cuando otro proceso (ej. dev server) tiene bloqueado el engine de Prisma.
 * Uso: node scripts/prisma-generate.js
 */
const path = require("path");
const { spawnSync } = require("child_process");
const fs = require("fs");

const root = path.join(__dirname, "..");
const maxAttempts = 3;
const delayMs = 2500;

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });
}

loadEnv(path.join(root, ".env"));
loadEnv(path.join(root, ".env.local"));

function runGenerate() {
  const r = spawnSync("npx", ["prisma", "generate"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  return r.status;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const status = runGenerate();
    if (status === 0) {
      process.exit(0);
    }
    if (attempt < maxAttempts) {
      console.error(
        `prisma generate falló (intento ${attempt}/${maxAttempts}). Reintentando en ${delayMs / 1000}s...`
      );
      await sleep(delayMs);
    } else {
      console.error("prisma generate falló después de", maxAttempts, "intentos.");
      process.exit(status);
    }
  }
})();
