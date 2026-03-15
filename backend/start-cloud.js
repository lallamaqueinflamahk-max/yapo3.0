/**
 * Inicio en cloud: levanta WebSocket (server.js) y Wallet API (wallet-api.js).
 * Uso: node start-cloud.js
 * Variables: WS_PORT (default 3001), WALLET_API_PORT (default 3002).
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WS_PORT = Number(process.env.WS_PORT) || 3001;
const WALLET_API_PORT = Number(process.env.WALLET_API_PORT) || 3002;

function run(name, script, env) {
  const child = spawn("node", [script], {
    cwd: __dirname,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  child.on("error", (err) => {
    console.error("[" + name + "] error:", err);
    process.exit(1);
  });
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) process.exit(code);
  });
  return child;
}

console.log("Starting YAPO backend (WS + Wallet API)...");
run("ws", join(__dirname, "server.js"), { WS_PORT });
run("wallet-api", join(__dirname, "wallet-api.js"), { WALLET_API_PORT });
console.log("WS port " + WS_PORT + ", Wallet API port " + WALLET_API_PORT);
