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
      <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-foreground/70">Cargando perfil...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-24 pt-6">
        <h1 className="mb-4 text-xl font-bold text-yapo-blue">Mi perfil</h1>
        <p className="text-yapo-red">{error ?? "No se pudo cargar el perfil."}</p>
        {error?.includes("sesión") && (
          <Link href="/login" className="mt-4 inline-block font-medium text-yapo-blue underline">
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
    <main className="flex min-h-screen flex-col bg-yapo-blue-light/30 px-4 pb-28 pt-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-yapo-blue">Mi perfil</h1>
        <SafeModeRoleSelector />
      </header>

      {/* Progreso de perfil (gamificación, reduce abandono) */}
      <section className="mb-4 rounded-xl border border-yapo-blue/15 bg-yapo-white p-3" aria-label="Progreso del perfil">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-yapo-blue">
            {profileCompleteness >= 100 ? "Perfil completo" : "Tu perfil está al " + profileCompleteness + "%"}
          </span>
          {profileCompleteness < 100 && (
            <span className="text-xs text-foreground/70">Completá datos para desbloquear todo</span>
          )}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-yapo-blue/10">
          <div
            className="h-full rounded-full bg-yapo-emerald transition-all duration-300"
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
      <div className="mb-4">
        <WhatsAppButton
          phone={user.whatsapp ?? undefined}
          message="Hola, consulta desde YAPÓ"
          label="Contactar por WhatsApp"
          className="w-full"
        />
      </div>

      {/* Datos personales: nombre, capacitaciones, título, etc. */}
      <div className="mb-4">
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
      <div className="mb-4">
        <ProfileRatingAndPerformance
          rating={rating}
          profession={profession}
          performance={performance}
        />
      </div>

      {/* Historial */}
      <div className="mb-4">
        <ProfileHistorial entries={historial} />
      </div>

      {/* Antecedentes policiales y judiciales */}
      <div className="mb-4">
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
      <section id="servicios-especiales" className="mb-6 rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4 scroll-mt-20" aria-label="Servicios especiales">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
          Servicios especiales
        </h2>
        <p className="mb-4 text-sm text-foreground/80">
          Verificación de identidad para operaciones sensibles (transferencias, activación de escudos, acceso a subsidios).
        </p>
        <ul className="space-y-3">
          <li className="flex gap-3 rounded-xl border border-yapo-blue/10 p-3">
            <span className="text-xl" aria-hidden>👆</span>
            <div>
              <h3 className="font-semibold text-yapo-blue">Huella digital</h3>
              <p className="text-sm text-foreground/80">Confirmá pagos y operaciones con tu huella en el dispositivo. Nivel de seguridad alto.</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-yapo-blue/10 p-3">
            <span className="text-xl" aria-hidden>🔐</span>
            <div>
              <h3 className="font-semibold text-yapo-blue">Biometría facial</h3>
              <p className="text-sm text-foreground/80">Reconocimiento facial para verificación de identidad y acceso a beneficios verificados.</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-yapo-blue/10 p-3">
            <span className="text-xl" aria-hidden>📋</span>
            <div>
              <h3 className="font-semibold text-yapo-blue">Verificación de documento</h3>
              <p className="text-sm text-foreground/80">Subí tu documento para desbloquear el plan Verificado y la billetera.</p>
            </div>
          </li>
        </ul>
        <p className="mt-3 text-xs text-foreground/70">
          Estos servicios se activan desde Billetera o cuando el Buscador YAPÓ lo solicite para una operación (ej. transferencia grande).
        </p>
      </section>

      {/* Accesos rápidos */}
      <section className="mb-6 rounded-2xl border border-yapo-blue/15 bg-yapo-white p-4" aria-label="Accesos rápidos">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yapo-blue/80">
          Accesos rápidos
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex min-h-[56px] items-center gap-4 rounded-xl border-2 border-yapo-blue/20 bg-yapo-white px-4 py-3 text-left font-semibold text-yapo-blue shadow-sm transition-[transform,background,border-color] active:scale-[0.98] active:border-yapo-blue/40 active:bg-yapo-blue/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yapo-red/10 text-yapo-red">
                  <Icon className="h-6 w-6" />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
