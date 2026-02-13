#!/usr/bin/env node
/**
 * Checklist automática: variables de entorno documentadas y build.
 * Ejecutar: npm run validate
 * Mismo código en localhost, Vercel y ngrok; todo se decide por env vars.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const ENV_EXAMPLE = path.join(ROOT, ".env.example");

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_WS_URL",
  "NEXT_PUBLIC_SAFE_MODE",
  "NEXT_PUBLIC_AI_MODE",
  "NEXT_PUBLIC_VOICE_MODE",
];

let failed = 0;

function log(name, ok, detail = "") {
  const icon = ok ? "✓" : "✗";
  const msg = ok ? name : `${name} ${detail}`.trim();
  console.log(`  ${icon} ${msg}`);
  if (!ok) failed++;
}

// 1. .env.example existe y documenta las variables
console.log("\n1. Variables de entorno (.env.example)\n");
if (!fs.existsSync(ENV_EXAMPLE)) {
  log(".env.example existe", false, "(no encontrado)");
} else {
  const content = fs.readFileSync(ENV_EXAMPLE, "utf8");
  for (const v of REQUIRED_ENV_VARS) {
    log(v, content.includes(v));
  }
}

// 2. Build
console.log("\n2. Build (next build)\n");
try {
  execSync("npm run build", {
    cwd: ROOT,
    stdio: "inherit",
  });
  log("next build", true);
} catch (e) {
  log("next build", false, "(falló)");
}

console.log("");
if (failed > 0) {
  console.log("Checklist: fallaron", failed, "ítem(s).\n");
  process.exit(1);
}
console.log("Checklist: todo OK. App lista para localhost, Vercel y ngrok.\n");
process.exit(0);
