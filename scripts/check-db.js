/**
 * Comprueba conexión a PostgreSQL usando DATABASE_URL de .env / .env.local
 * Uso: node scripts/check-db.js  (o npm run db:check)
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
const envLocalPath = path.join(root, ".env.local");

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

loadEnv(envPath);
loadEnv(envLocalPath);

const url = process.env.DATABASE_URL;
if (!url || !url.startsWith("postgresql://")) {
  console.error("Error: DATABASE_URL no está definida en .env o .env.local.");
  console.error("Añadí: DATABASE_URL=\"postgresql://postgres:TU_PASSWORD@localhost:5432/yapo\"");
  process.exit(1);
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log("OK: Conexión a la base de datos correcta.");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Error de conexión:", e.message);
    if (e.message.includes("does not exist")) {
      console.error("\nLa base de datos 'yapo' no existe. Creala en PostgreSQL con:");
      console.error('  psql -U postgres -c "CREATE DATABASE yapo;"');
      console.error("O en pgAdmin: clic derecho en Databases → Create → Database → nombre: yapo");
    }
    if (e.message.includes("Authentication failed")) {
      console.error("\nRevisá usuario y contraseña en DATABASE_URL (.env o .env.local).");
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
