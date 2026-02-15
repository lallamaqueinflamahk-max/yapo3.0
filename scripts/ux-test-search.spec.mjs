/**
 * Script de testing UX – flujo de búsqueda en /mapa.
 * Ejecutar con: node scripts/ux-test-search.spec.mjs
 * Requiere servidor dev en marcha (npm run dev) o usar BASE_URL.
 *
 * Verifica que la página de búsqueda tenga los elementos críticos para
 * Task Success: input, CTA, zona de resultados. Opcional: Playwright para E2E.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function fetchMapaPage() {
  const res = await fetch(`${BASE_URL}/mapa`, {
    redirect: "follow",
    headers: { "User-Agent": "UXTestScript/1.0" },
  });
  return { ok: res.ok, status: res.status, html: await res.text() };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[UX Test] ${message}`);
  }
}

async function run() {
  console.log("[UX Test] Flujo búsqueda – /mapa");
  console.log("[UX Test] BASE_URL:", BASE_URL);

  const { ok, status, html } = await fetchMapaPage();
  assert(ok, `GET /mapa debe devolver 200, obtuvo ${status}`);
  assert(html.length > 0, "HTML no vacío");

  const checks = [
    { name: "Input de búsqueda", test: () => html.includes("placeholder") && (html.includes("servicio") || html.includes("Buscar") || html.includes("Qué")) },
    { name: "CTA principal", test: () => html.includes("Buscar profesionales") || html.includes("Buscar") },
    { name: "Mapa o contenedor mapa", test: () => html.includes("mapa") || html.includes("Map") || html.includes("leaflet") },
    { name: "Zona/barrio/filtros", test: () => html.includes("barrio") || html.includes("Departamento") || html.includes("oficio") },
  ];

  let passed = 0;
  for (const { name, test } of checks) {
    const result = test();
    if (result) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
    }
  }

  console.log(`[UX Test] ${passed}/${checks.length} checks pasaron`);
  if (passed < checks.length) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
