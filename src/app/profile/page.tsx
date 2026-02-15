"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import IconHome from "@/components/icons/IconHome";
import IconWallet from "@/components/icons/IconWallet";
import IconCerebro from "@/components/icons/IconCerebro";
import IconProfile from "@/components/icons/IconProfile";
import IconChat from "@/components/icons/IconChat";
import { useSession } from "@/lib/auth";
import SafeModeRoleSelector from "@/components/auth/SafeModeRoleSelector";
import {
  ProfileHeader,
  ProfilePersonalData,
  ProfileRatingAndPerformance,
  ProfileHistorial,
  ProfileAntecedentes,
  ProfilePYMEEnterprise,
  ProfileSponsors,
  ProfileProductOffers,
  ProfileVideoReels,
  ProfileProfessionalsNearby,
  ProfileSubscriptionPlans,
  ProfileRatingsSection,
  ProfileCapacitaciones,
  ProfileCurriculumIA,
  ProfileEscudosLink,
} from "@/components/profile";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import {
  SUBSCRIPTION_PLANS,
  SPONSORS_MOCK,
  PRODUCT_OFFERS_BONUS_MOCK,
  getProfessionalsNearbyMock,
} from "@/data/profile-mock";
import type { RoleId } from "@/lib/auth";

interface MeResponse {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    whatsapp?: string | null;
    subscriptionPlanSlug?: string | null;
    subscriptionPlanName?: string | null;
    subscriptionPlanPricePyG?: number;
  };
  profile: {
    country?: string | null;
    territory?: string | null;
    workStatus?: string | null;
    workType?: string | null;
    education?: string | null;
    certifications?: string | null;
    profileStatus?: string;
  } | null;
  verified: boolean;
  badges: string[];
  rating: number;
  profession: string;
  performance: string;
  historial: { id: string; type: string; title: string; date: string; detail?: string }[];
  antecedentesRequeridos: boolean;
  antecedentesCompletados: boolean;
  ruc?: string | null;
  contactoRRHH?: string | null;
  telefono?: string | null;
  planillaMinisterioSubida?: boolean;
}

const QUICK_LINKS = [
  { href: "/home", label: "Inicio", Icon: IconHome },
  { href: "/wallet", label: "Billetera", Icon: IconWallet },
  { href: "/chat", label: "Chat", Icon: IconChat },
  { href: "/cerebro", label: "Buscador YAPÓ", Icon: IconCerebro },
  { href: "#planes", label: "Planes y suscripción", Icon: IconProfile },
  { href: "#servicios-especiales", label: "Biometría y huella", Icon: IconProfile },
] as const;

function buildFallbackMe(identity: { userId: string; roles: string[] } | null): MeResponse | null {
  if (!identity?.userId) return null;
  const role = identity.roles?.[0] ?? "vale";
  const isDemo = identity.userId === "safe-user" || identity.userId === "dev-master";
  return {
    user: {
      id: identity.userId,
      name: isDemo ? (identity.userId === "dev-master" ? "Dev Master" : "Usuario demo") : undefined,
      email: isDemo ? "demo@yapo.local" : undefined,
      image: null,
      role,
      whatsapp: "595981555555",
      subscriptionPlanSlug: "vale",
      subscriptionPlanName: "Valé",
      subscriptionPlanPricePyG: 0,
    },
    profile: null,
    verified: isDemo,
    badges: isDemo ? ["Demo"] : [],
    rating: 4.5,
    profession: "Por definir",
    performance: "—",
    historial: [],
    antecedentesRequeridos: false,
    antecedentesCompletados: true,
    ruc: null,
    contactoRRHH: null,
    telefono: null,
    planillaMinisterioSubida: false,
  };
}

export default function ProfilePage() {
  const { identity } = useSession();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) {
          const fallback = buildFallbackMe(identity ?? null);
          if (fallback && !cancelled) setData(fallback);
          else if (!cancelled) setError("Iniciá sesión para ver tu perfil.");
          return null;
        }
        if (r.status === 404) {
          setError("Usuario no encontrado.");
          return null;
        }
        if (!r.ok) throw new Error("Error al cargar perfil");
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        if (d == null) return;
        if (!d.user) {
          setError("Datos de perfil incompletos.");
          return;
        }
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/cdb4230b-daff-48fe-87c3-cb3e79b1f0a1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'profile/page.tsx:meSuccess',message:'/api/auth/me success',data:{hasUser:!!d.user,userRole:d.user?.role,verified:d.verified},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        setData({
          user: {
            ...d.user,
            whatsapp: d.user.whatsapp ?? undefined,
            subscriptionPlanSlug: d.user.subscriptionPlanSlug ?? undefined,
            subscriptionPlanName: d.user.subscriptionPlanName ?? undefined,
            subscriptionPlanPricePyG: d.user.subscriptionPlanPricePyG ?? undefined,
          },
          profile: d.profile ?? null,
          verified: Boolean(d.verified),
          badges: Array.isArray(d.badges) ? d.badges : [],
          rating: typeof d.rating === "number" ? d.rating : 0,
          profession: String(d.profession ?? "Por definir"),
          performance: String(d.performance ?? "—"),
          historial: Array.isArray(d.historial) ? d.historial : [],
          antecedentesRequeridos: Boolean(d.antecedentesRequeridos),
          antecedentesCompletados: Boolean(d.antecedentesCompletados),
          ruc: d.ruc ?? null,
          contactoRRHH: d.contactoRRHH ?? null,
          telefono: d.telefono ?? null,
          planillaMinisterioSubida: Boolean(d.planillaMinisterioSubida),
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar perfil");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [identity?.userId, identity?.roles]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-gris-ui px-4 pb-24 pt-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gris-texto-light">Cargando perfil...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col bg-gris-ui px-4 pb-24 pt-6">
        <h1 className="mb-4 text-xl font-bold text-yapo-petroleo">Mi perfil</h1>
        <p className="text-yapo-red">{error ?? "No se pudo cargar el perfil."}</p>
        {error?.includes("sesión") && (
          <Link href="/login" className="mt-4 inline-block font-medium text-yapo-cta underline">
            Ir a iniciar sesión
          </Link>
        )}
      </main>
    );
  }

  const { user, profile, verified, badges, rating, profession, performance, historial, antecedentesRequeridos, antecedentesCompletados, ruc, contactoRRHH, telefono, planillaMinisterioSubida } = data;
  const role = user.role as RoleId;

  const profileCompleteness = (() => {
    if (profile?.profileStatus === "OK") return 100;
    const fields = [profile?.country, profile?.territory, profile?.workStatus, profile?.workType, profile?.education];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / 5) * 100);
  })();

  return (
    <main className="flex min-h-screen flex-col bg-gris-ui px-4 pb-28 pt-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-yapo-petroleo">Mi perfil</h1>
        <SafeModeRoleSelector />
      </header>

      {/* Progreso de perfil (gamificación, reduce abandono) */}
      <section className="mb-4 rounded-2xl border-l-4 border-l-yapo-cta border border-yapo-cta/20 bg-gradient-to-r from-yapo-white to-yapo-cta/5 p-3 shadow-md" aria-label="Progreso del perfil">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-yapo-petroleo">
            {profileCompleteness >= 100 ? "Perfil completo" : "Tu perfil está al " + profileCompleteness + "%"}
          </span>
          {profileCompleteness < 100 && (
            <span className="text-xs text-gris-texto">Completá datos para desbloquear todo</span>
          )}
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gris-ui">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yapo-validacion to-yapo-emerald transition-all duration-300"
            style={{ width: `${Math.min(100, profileCompleteness)}%` }}
            role="progressbar"
            aria-valuenow={profileCompleteness}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </section>

      {/* Foto, nombre, rol, verificado, badges */}
      <div className="mb-4">
        <ProfileHeader
          name={user.name}
          image={user.image}
          role={role}
          verified={verified}
          badges={badges}
          email={user.email}
        />
      </div>

      {/* WhatsApp YAPÓ / contacto */}
      <div className="mb-4 rounded-2xl overflow-hidden shadow-md ring-2 ring-yapo-validacion/30">
        <WhatsAppButton
          phone={user.whatsapp ?? undefined}
          message="Hola, consulta desde YAPÓ"
          label="Contactar por WhatsApp"
          className="w-full"
        />
      </div>

      {/* Datos personales: nombre, capacitaciones, título, etc. */}
      <div className="mb-4 rounded-2xl overflow-hidden border-l-4 border-l-yapo-blue shadow-md">
        <ProfilePersonalData
          country={profile?.country}
          territory={profile?.territory}
          workStatus={profile?.workStatus}
          workType={profile?.workType}
          education={profile?.education}
          certifications={profile?.certifications}
          telefono={telefono}
          titulo={profile?.workType}
        />
      </div>

      {/* Calificación como profesional, profesión, desempeño */}
      <div className="mb-4 rounded-2xl overflow-hidden border-l-4 border-l-yapo-amber shadow-md">
        <ProfileRatingAndPerformance
          rating={rating}
          profession={profession}
          performance={performance}
        />
      </div>

      {/* Historial */}
      <div className="mb-4 rounded-2xl overflow-hidden border-l-4 border-l-yapo-blue-soft shadow-md">
        <ProfileHistorial entries={historial} />
      </div>

      {/* Antecedentes policiales y judiciales */}
      <div className="mb-4 rounded-2xl overflow-hidden border-l-4 border-l-yapo-validacion shadow-md">
        <ProfileAntecedentes requeridos={antecedentesRequeridos} completados={antecedentesCompletados} />
      </div>

      {/* PYME / Enterprise: RUC, contacto RRHH, planillas ministerio */}
      <div className="mb-4">
        <ProfilePYMEEnterprise
          role={role}
          ruc={ruc}
          contactoRRHH={contactoRRHH}
          telefono={telefono}
          planillaMinisterioSubida={planillaMinisterioSubida}
        />
      </div>

      {/* Calificaciones entre usuarios / clientes / empresas */}
      <div className="mb-4">
        <ProfileRatingsSection />
      </div>

      {/* Sponsors */}
      <div className="mb-4">
        <ProfileSponsors sponsors={SPONSORS_MOCK} />
      </div>

      {/* Ofertas para comprar con bonificaciones */}
      <div className="mb-4">
        <ProfileProductOffers offers={PRODUCT_OFFERS_BONUS_MOCK} />
      </div>

      {/* Videos formato reels (promoción trabajo / PYME) */}
      <div className="mb-4">
        <ProfileVideoReels />
      </div>

      {/* Profesionales cerca de mí (GPS) */}
      <div className="mb-4">
        <ProfileProfessionalsNearby professionals={getProfessionalsNearbyMock()} />
      </div>

      {/* Planes de suscripción: Valé → Verificado (bioseguridad) → Capeto → Kavaju → Mbareté + contratantes */}
      <div id="planes" className="mb-4 scroll-mt-20">
        <ProfileSubscriptionPlans plans={SUBSCRIPTION_PLANS} currentRole={user?.role} />
      </div>

      {/* Los 4 escudos: siempre visibles */}
      <ProfileEscudosLink />

      {/* Rincón de capacitaciones y ofertas de estudio */}
      <ProfileCapacitaciones />

      {/* Currículum digital con YAPÓ IA */}
      <ProfileCurriculumIA />

      {/* Servicios especiales: biometría y huella digital */}
      <section id="servicios-especiales" className="mb-6 rounded-2xl border-2 border-yapo-blue/20 bg-gradient-to-b from-yapo-white to-yapo-blue-light/20 p-4 shadow-md scroll-mt-20" aria-label="Servicios especiales">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
          Servicios especiales
        </h2>
        <p className="mb-4 text-sm text-gris-texto">
          Verificación de identidad para operaciones sensibles (transferencias, activación de escudos, acceso a subsidios).
        </p>
        <ul className="space-y-3">
          <li className="flex gap-3 rounded-xl border-l-4 border-l-yapo-cta border border-gris-ui-border bg-yapo-white p-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yapo-cta/20 text-xl" aria-hidden>👆</span>
            <div>
              <h3 className="font-semibold text-yapo-petroleo">Huella digital</h3>
              <p className="text-sm text-gris-texto">Confirmá pagos y operaciones con tu huella en el dispositivo. Nivel de seguridad alto.</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border-l-4 border-l-yapo-blue border border-gris-ui-border bg-yapo-white p-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yapo-blue/20 text-xl" aria-hidden>🔐</span>
            <div>
              <h3 className="font-semibold text-yapo-petroleo">Biometría facial</h3>
              <p className="text-sm text-gris-texto">Reconocimiento facial para verificación de identidad y acceso a beneficios verificados.</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border-l-4 border-l-yapo-validacion border border-gris-ui-border bg-yapo-white p-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yapo-validacion/20 text-xl" aria-hidden>📋</span>
            <div>
              <h3 className="font-semibold text-yapo-petroleo">Verificación de documento</h3>
              <p className="text-sm text-gris-texto">Subí tu documento para desbloquear el plan Verificado y la billetera.</p>
            </div>
          </li>
        </ul>
        <p className="mt-3 text-xs text-gris-texto-light">
          Estos servicios se activan desde Billetera o cuando el Buscador YAPÓ lo solicite para una operación (ej. transferencia grande).
        </p>
      </section>

      {/* Accesos rápidos */}
      <section className="mb-6 rounded-2xl border-2 border-yapo-cta/20 bg-gradient-to-br from-yapo-white to-yapo-cta/5 p-4 shadow-md" aria-label="Accesos rápidos">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-petroleo">
          Accesos rápidos
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, label, Icon }, i) => {
            const colors = [
              "bg-yapo-cta/15 text-yapo-cta",
              "bg-yapo-blue/15 text-yapo-blue",
              "bg-yapo-validacion/15 text-yapo-validacion-dark",
              "bg-yapo-cta/15 text-yapo-cta",
              "bg-yapo-blue/15 text-yapo-blue",
              "bg-yapo-validacion/15 text-yapo-validacion-dark",
            ];
            const c = colors[i % colors.length];
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-[56px] items-center gap-4 rounded-xl border-2 border-gris-ui-border bg-yapo-white px-4 py-3 text-left font-semibold text-yapo-petroleo shadow-md transition-all hover:border-yapo-cta/40 hover:bg-yapo-cta/5 hover:shadow-lg active:scale-[0.98]"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
