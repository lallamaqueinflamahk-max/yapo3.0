/**
 * Seed YAPÓ 3.0: usuarios, planes, semáforos, consentimientos, wallets, escudos, métricas.
 * Ejecutar: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed.ts
 * o: npm run db:seed
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const YAPO_WHATSAPP = process.env.YAPO_WHATSAPP_NUMBER || "595981555555";

async function main() {
  console.log("🌱 Seed YAPÓ 3.0...");

  // 1. Planes de suscripción: precios atractivos y justos (Básico 20.000 PYG, escalada por beneficios y acceso a datos)
  const plans = [
    { slug: "basico", name: "Básico", pricePyG: 20000, period: "month", maxOffers: 3, maxTransfers: 5, benefits: '["Perfil visible","3 ofertas","Chat básico","Mapa: zonas básicas"]' },
    { slug: "vale", name: "Valé", pricePyG: 35000, period: "month", maxOffers: 10, maxTransfers: 20, benefits: '["Feed","Postulaciones","Comunidad","Mapa: trabajadores por rubro, densidad, mejor desempeño"]' },
    { slug: "capeto", name: "Capeto", pricePyG: 55000, period: "month", maxOffers: 25, maxTransfers: 50, benefits: '["Cuadrilla","Validación equipo","Mapa: desempleados por barrio/rubro"]' },
    { slug: "kavaju", name: "Kavaju", pricePyG: 85000, period: "month", maxOffers: null, maxTransfers: null, benefits: '["Supervisión","Reportes","Mapa: zonas rojas (riesgo)"]' },
    { slug: "mbarete", name: "Mbareté", pricePyG: 130000, period: "month", maxOffers: null, maxTransfers: null, benefits: '["Territorio","Beca Laboral","Mapa: capacitación, calidad vales"]' },
    { slug: "pyme", name: "PyME", pricePyG: 249000, period: "month", maxOffers: 100, maxTransfers: null, benefits: '["Equipos","RUC","RRHH","Mapa: demanda por rubro, todas las capas"]' },
    { slug: "enterprise", name: "Enterprise", pricePyG: 549000, period: "month", maxOffers: null, maxTransfers: null, benefits: '["Planillas","Múltiples sedes","Mapa: datos completos, exportación"]' },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    });
  }
  console.log("  ✓ Planes de suscripción");

  // 2. Semáforos (zonas mock)
  const zones = [
    { zone: "Central", state: "green" },
    { zone: "Alto Paraná", state: "green" },
    { zone: "Itapúa", state: "yellow" },
    { zone: "Boquerón", state: "red" },
  ];
  for (const z of zones) {
    await prisma.semaphore.upsert({
      where: { zone: z.zone },
      create: z,
      update: { state: z.state },
    });
  }
  console.log("  ✓ Semáforos");

  // 3. Escudos (Shield)
  const shieldTypes = ["SALUD", "FINTECH", "COMUNIDAD", "SUBSIDIO"];
  for (const t of shieldTypes) {
    const existing = await prisma.shield.findFirst({ where: { type: t } });
    if (!existing) {
      await prisma.shield.create({ data: { type: t, level: 1, active: true } });
    }
  }
  console.log("  ✓ Escudos");

  // 4. Usuarios (avatar, whatsapp, plan, profileStatus OK)
  const defaultHash = await bcrypt.hash("Demo123!", 10);
  const users = [
    { email: "admin@yapo.local", name: "Admin YAPÓ", role: "mbarete", plan: "mbarete", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin" },
    { email: "pyme@yapo.local", name: "PyME Demo", role: "pyme", plan: "pyme", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=pyme" },
    { email: "enterprise@yapo.local", name: "Enterprise Demo", role: "enterprise", plan: "enterprise", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=enterprise" },
    { email: "vale@yapo.local", name: "Valé Demo", role: "vale", plan: "vale", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=vale" },
    { email: "capeto@yapo.local", name: "Capeto Demo", role: "capeto", plan: "capeto", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=capeto" },
    { email: "kavaju@yapo.local", name: "Kavaju Demo", role: "kavaju", plan: "kavaju", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=kavaju" },
    { email: "basico@yapo.local", name: "Usuario Básico", role: "vale", plan: "basico", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=basico" },
  ];
  const createdUsers: { id: string; email: string }[] = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: defaultHash,
        provider: "credentials",
        role: u.role,
        subscriptionPlanId: u.plan,
        whatsapp: YAPO_WHATSAPP,
        image: u.image,
      },
      update: { name: u.name, role: u.role, subscriptionPlanId: u.plan, whatsapp: YAPO_WHATSAPP, image: u.image },
    });
    createdUsers.push({ id: user.id, email: user.email });
  }
  console.log("  ✓ Usuarios");

  // 5. Perfiles OK para todos
  for (const u of createdUsers) {
    await prisma.profile.upsert({
      where: { userId: u.id },
      create: {
        userId: u.id,
        country: "Paraguay",
        territory: "Central",
        workStatus: "Activo",
        workType: "Varios",
        profileStatus: "OK",
      },
      update: { profileStatus: "OK", country: "Paraguay", territory: "Central", workStatus: "Activo", workType: "Varios" },
    });
  }
  console.log("  ✓ Perfiles");

  // 6. Consent (privacy, terms, consent-login)
  for (const u of createdUsers) {
    const versions = ["privacy-v1", "terms-v1", "consent-login"];
    for (const v of versions) {
      const exists = await prisma.consent.findFirst({ where: { userId: u.id, version: v } });
      if (!exists) {
        await prisma.consent.create({
          data: { userId: u.id, version: v, acceptedAt: new Date(), ip: "127.0.0.1", userAgent: "seed" },
        });
      }
    }
  }
  console.log("  ✓ Consentimientos");

  // 7. Wallets y transacciones iniciales
  for (const u of createdUsers) {
    const w = await prisma.wallet.upsert({
      where: { userId: u.id },
      create: { userId: u.id, balance: 0, status: "ACTIVE" },
      update: {},
    });
    const count = await prisma.walletTransaction.count({ where: { walletId: w.id } });
    if (count === 0 && u.email.includes("admin")) {
      await prisma.walletTransaction.create({
        data: { walletId: w.id, type: "CREDIT", amount: 100000, reason: "Seed inicial" },
      });
      await prisma.wallet.update({ where: { id: w.id }, data: { balance: 100000 } });
    }
  }
  console.log("  ✓ Wallets");

  // 8. Ratings (empleado ↔ empleador) - muestras
  if (createdUsers.length >= 3) {
    const [a, b, c] = createdUsers;
    const ratings = [
      { fromUserId: a.id, toUserId: b.id, score: 5, type: "employer_to_employee", comment: "Excelente" },
      { fromUserId: b.id, toUserId: a.id, score: 5, type: "employee_to_employer", comment: "Muy buen trato" },
    ];
    for (const r of ratings) {
      const exists = await prisma.rating.findFirst({
        where: { fromUserId: r.fromUserId, toUserId: r.toUserId, type: r.type },
      });
      if (!exists) await prisma.rating.create({ data: r });
    }
    console.log("  ✓ Calificaciones");
  }

  // 9. Geografía Paraguay (barrios con slug para mapa GPS) + Rubros + Métricas semáforo
  const barriosGeo = [
    { slug: "asuncion-botanic", departamento: "Central", ciudad: "Asunción", barrioNombre: "Botánico", lat: -25.282, lng: -57.575 },
    { slug: "asuncion-sajonia", departamento: "Central", ciudad: "Asunción", barrioNombre: "Sajonia", lat: -25.278, lng: -57.568 },
    { slug: "asuncion-loma-pyta", departamento: "Central", ciudad: "Asunción", barrioNombre: "Loma Pytã", lat: -25.275, lng: -57.582 },
    { slug: "lambare-centro", departamento: "Central", ciudad: "Lambaré", barrioNombre: "Centro", lat: -25.318, lng: -57.635 },
    { slug: "lambare-tycua", departamento: "Central", ciudad: "Lambaré", barrioNombre: "Tycua", lat: -25.312, lng: -57.628 },
    { slug: "fdm-centro", departamento: "Central", ciudad: "Fernando de la Mora", barrioNombre: "Centro", lat: -25.338, lng: -57.585 },
    { slug: "fdm-santa-rosa", departamento: "Central", ciudad: "Fernando de la Mora", barrioNombre: "Santa Rosa", lat: -25.332, lng: -57.578 },
    { slug: "fdm-san-miguel", departamento: "Central", ciudad: "Fernando de la Mora", barrioNombre: "San Miguel", lat: -25.335, lng: -57.582 },
    { slug: "cde-centro", departamento: "Alto Paraná", ciudad: "Ciudad del Este", barrioNombre: "Centro", lat: -25.509, lng: -54.615 },
    { slug: "cde-monday", departamento: "Alto Paraná", ciudad: "Ciudad del Este", barrioNombre: "Monday", lat: -25.515, lng: -54.608 },
    { slug: "minga-centro", departamento: "Alto Paraná", ciudad: "Minga Guazú", barrioNombre: "Centro", lat: -25.465, lng: -54.758 },
    { slug: "enc-centro", departamento: "Itapúa", ciudad: "Encarnación", barrioNombre: "Centro", lat: -27.335, lng: -55.900 },
    { slug: "enc-san-isidro", departamento: "Itapúa", ciudad: "Encarnación", barrioNombre: "San Isidro", lat: -27.342, lng: -55.892 },
    { slug: "camb-centro", departamento: "Itapúa", ciudad: "Cambyretá", barrioNombre: "Centro", lat: -27.218, lng: -55.785 },
    { slug: "paraguari-centro", departamento: "Paraguarí", ciudad: "Paraguarí", barrioNombre: "Centro", lat: -25.620, lng: -57.150 },
    { slug: "fil-centro", departamento: "Boquerón", ciudad: "Filadelfia", barrioNombre: "Centro", lat: -22.340, lng: -60.032 },
  ];
  for (const b of barriosGeo) {
    await prisma.geografiaPy.upsert({
      where: { slug: b.slug },
      create: {
        slug: b.slug,
        departamento: b.departamento,
        ciudad: b.ciudad,
        barrioNombre: b.barrioNombre,
        latitudCentro: b.lat,
        longitudCentro: b.lng,
      },
      update: { departamento: b.departamento, ciudad: b.ciudad, barrioNombre: b.barrioNombre, latitudCentro: b.lat, longitudCentro: b.lng },
    });
  }
  console.log("  ✓ Geografía (barrios)");

  const rubros = [
    { nombre: "Empleada doméstica", slug: "empleada-domestica" },
    { nombre: "Electricista", slug: "electricista" },
    { nombre: "Plomero", slug: "plomero" },
    { nombre: "Carpintero", slug: "carpintero" },
    { nombre: "Pintor", slug: "pintor" },
    { nombre: "Jardinería", slug: "jardineria" },
    { nombre: "Panadero", slug: "panadero" },
    { nombre: "Cuidado personas", slug: "cuidado-personas" },
    { nombre: "Delivery", slug: "delivery" },
    { nombre: "Mecánico", slug: "mecanico" },
    { nombre: "Ventas", slug: "ventas" },
    { nombre: "Contador", slug: "contador" },
    { nombre: "Limpieza", slug: "limpieza" },
  ];
  for (const r of rubros) {
    await prisma.rubro.upsert({
      where: { nombre: r.nombre },
      create: r,
      update: { slug: r.slug },
    });
  }
  console.log("  ✓ Rubros");

  const NivelAlerta = { Verde: "Verde", Amarillo: "Amarillo", Rojo: "Rojo" };
  const metricasPorBarrio = [
    { slug: "asuncion-botanic", rubros: [{ rubro: "Empleada doméstica", count: 24 }, { rubro: "Electricista", count: 12 }, { rubro: "Plomero", count: 8 }] },
    { slug: "asuncion-sajonia", rubros: [{ rubro: "Empleada doméstica", count: 31 }, { rubro: "Carpintero", count: 9 }, { rubro: "Pintor", count: 7 }] },
    { slug: "asuncion-loma-pyta", rubros: [{ rubro: "Empleada doméstica", count: 18 }, { rubro: "Jardinería", count: 11 }] },
    { slug: "fdm-centro", rubros: [{ rubro: "Electricista", count: 15 }, { rubro: "Empleada doméstica", count: 22 }, { rubro: "Panadero", count: 4 }] },
    { slug: "fdm-santa-rosa", rubros: [{ rubro: "Empleada doméstica", count: 19 }, { rubro: "Cuidado personas", count: 6 }] },
    { slug: "lambare-centro", rubros: [{ rubro: "Delivery", count: 14 }, { rubro: "Mecánico", count: 8 }] },
    { slug: "lambare-tycua", rubros: [{ rubro: "Empleada doméstica", count: 12 }, { rubro: "Plomero", count: 5 }] },
    { slug: "cde-centro", rubros: [{ rubro: "Ventas", count: 28 }, { rubro: "Contador", count: 12 }] },
    { slug: "cde-monday", rubros: [{ rubro: "Empleada doméstica", count: 15 }, { rubro: "Electricista", count: 9 }] },
    { slug: "enc-centro", rubros: [{ rubro: "Empleada doméstica", count: 20 }, { rubro: "Carpintero", count: 7 }] },
    { slug: "enc-san-isidro", rubros: [{ rubro: "Jardinería", count: 8 }, { rubro: "Limpieza", count: 11 }] },
  ];
  for (const m of metricasPorBarrio) {
    const barrio = await prisma.geografiaPy.findUnique({ where: { slug: m.slug } });
    if (!barrio) continue;
    for (const { rubro, count } of m.rubros) {
      await prisma.metricasSemaforo.upsert({
        where: { idBarrio_rubro: { idBarrio: barrio.idBarrio, rubro } },
        create: { idBarrio: barrio.idBarrio, rubro, densidadProf: count, demandaActiva: Math.floor(count / 3), nivelAlerta: NivelAlerta.Verde },
        update: { densidadProf: count, demandaActiva: Math.floor(count / 3) },
      });
    }
  }
  console.log("  ✓ Métricas semáforo (profesiones por barrio)");
  } catch (errGeo) {
    console.warn("  ⚠ Geografía/Rubros/Métricas omitidos (¿migración add_geografia_map aplicada?):", errGeo?.message || errGeo);
  }

  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
