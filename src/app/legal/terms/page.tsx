import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Uso | YAPÓ",
  description: "Términos y condiciones de uso de YAPÓ 3.0",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-yapo-white px-4 py-8 pt-20">
      <h1 className="text-2xl font-bold text-yapo-blue">Términos de Uso</h1>
      <p className="mt-2 text-sm text-foreground/80">Última actualización: 2025</p>
      <div className="prose prose-sm mt-6 max-w-none text-foreground/90">
        <p>
          Al usar YAPÓ 3.0 aceptás estos términos. La plataforma ofrece servicios de identidad laboral, ofertas, billetera, chat y video según tu plan y rol.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-yapo-blue">Uso aceptable</h2>
        <p>Te comprometés a no usar la app para actividades ilegales, suplantación, acoso ni abuso. El incumplimiento puede resultar en suspensión o baja de la cuenta.</p>
        <h2 className="mt-6 text-lg font-semibold text-yapo-blue">Planes y pagos</h2>
        <p>Los planes de suscripción (Básico, Valé, Capeto, Kavaju, PyME, Enterprise) tienen precios y límites publicados. Los pagos se gestionan según el método elegido y las políticas de reembolso vigentes.</p>
      </div>
      <p className="mt-8">
        <Link href="/home" className="font-medium text-yapo-blue underline">Volver al inicio</Link>
      </p>
    </main>
  );
}
