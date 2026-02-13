/**
 * Seed YAPÓ 3.0: usuarios, planes, semáforos, consentimientos, wallets, escudos.
 * Ejecutar: npm run db:seed  (requiere: npm run db:migrate antes)
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const YAPO_WHATSAPP = process.env.YAPO_WHATSAPP_NUMBER || "595981555555";

async function main() {
  console.log("🌱 Seed YAPÓ 3.0...");

  const plans = [
    { slug: "basico", name: "Básico", pricePyG: 0, period: "month", maxOffers: 3, maxTransfers: 5, benefits: '["Perfil visible","3 ofertas","Chat básico"]' },
    { slug: "vale", name: "Valé", pricePyG: 0, period: "month", maxOffers: 10, maxTransfers: 20, benefits: '["Feed","Postulaciones","Comunidad"]' },
    { slug: "capeto", name: "Capeto", pricePyG: 0, period: "month", maxOffers: 25, maxTransfers: 50, benefits: '["Cuadrilla","Validación equipo"]' },
    { slug: "kavaju", name: "Kavaju", pricePyG: 0, period: "month", maxOffers: null, maxTransfers: null, benefits: '["Supervisión","Reportes"]' },
    { slug: "mbarete", name: "Mbareté", pricePyG: 0, period: "month", maxOffers: null, maxTransfers: null, benefits: '["Territorio","Beca Laboral"]' },
    { slug: "pyme", name: "PyME", pricePyG: 149000, period: "month", maxOffers: 100, maxTransfers: null, benefits: '["Equipos","RUC","RRHH"]' },
    { slug: "enterprise", name: "Enterprise", pricePyG: 499000, period: "month", maxOffers: null, maxTransfers: null, benefits: '["Planillas","Múltiples sedes"]' },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({ where: { slug: p.slug }, create: p, update: p });
  }
  console.log("  ✓ Planes");

  const zones = [
    { zone: "Central", state: "green" },
    { zone: "Alto Paraná", state: "green" },
    { zone: "Itapúa", state: "yellow" },
    { zone: "Boquerón", state: "red" },
  ];
  for (const z of zones) {
    await prisma.semaphore.upsert({ where: { zone: z.zone }, create: z, update: { state: z.state } });
  }
  console.log("  ✓ Semáforos");

  for (const t of ["SALUD", "FINTECH", "COMUNIDAD", "SUBSIDIO"]) {
    const ex = await prisma.shield.findFirst({ where: { type: t } });
    if (!ex) await prisma.shield.create({ data: { type: t, level: 1, active: true } });
  }
  console.log("  ✓ Escudos");

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
  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: { email: u.email, name: u.name, passwordHash: defaultHash, provider: "credentials", role: u.role, subscriptionPlanId: u.plan, whatsapp: YAPO_WHATSAPP, image: u.image },
      update: { name: u.name, role: u.role, subscriptionPlanId: u.plan, whatsapp: YAPO_WHATSAPP, image: u.image },
    });
    createdUsers.push({ id: user.id, email: user.email });
  }
  console.log("  ✓ Usuarios");

  for (const u of createdUsers) {
    await prisma.profile.upsert({
      where: { userId: u.id },
      create: { userId: u.id, country: "Paraguay", territory: "Central", workStatus: "Activo", workType: "Varios", profileStatus: "OK" },
      update: { profileStatus: "OK", country: "Paraguay", territory: "Central", workStatus: "Activo", workType: "Varios" },
    });
  }
  console.log("  ✓ Perfiles");

  for (const u of createdUsers) {
    for (const v of ["privacy-v1", "terms-v1", "consent-login"]) {
      const ex = await prisma.consent.findFirst({ where: { userId: u.id, version: v } });
      if (!ex) await prisma.consent.create({ data: { userId: u.id, version: v, acceptedAt: new Date(), ip: "127.0.0.1", userAgent: "seed" } });
    }
  }
  console.log("  ✓ Consentimientos");

  for (const u of createdUsers) {
    const w = await prisma.wallet.upsert({ where: { userId: u.id }, create: { userId: u.id, balance: 0, status: "ACTIVE" }, update: {} });
    const count = await prisma.walletTransaction.count({ where: { walletId: w.id } });
    if (count === 0 && u.email.includes("admin")) {
      await prisma.walletTransaction.create({ data: { walletId: w.id, type: "CREDIT", amount: 100000, reason: "Seed inicial" } });
      await prisma.wallet.update({ where: { id: w.id }, data: { balance: 100000 } });
    }
  }
  console.log("  ✓ Wallets");

  if (createdUsers.length >= 2) {
    const [a, b] = createdUsers;
    const ex = await prisma.rating.findFirst({ where: { fromUserId: a.id, toUserId: b.id } });
    if (!ex) {
      await prisma.rating.create({ data: { fromUserId: a.id, toUserId: b.id, score: 5, type: "employer_to_employee", comment: "Excelente" } });
      await prisma.rating.create({ data: { fromUserId: b.id, toUserId: a.id, score: 5, type: "employee_to_employer", comment: "Muy buen trato" } });
    }
  }
  console.log("  ✓ Calificaciones");
  console.log("✅ Seed completado.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
