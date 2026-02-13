import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Consentimiento de datos | YAPÓ",
  description: "Consentimiento legal para el tratamiento de datos en YAPÓ 3.0",
};

export default function ConsentPage() {
  return (
    <main className="min-h-screen bg-yapo-white px-4 py-8 pt-20">
      <h1 className="text-2xl font-bold text-yapo-blue">Consentimiento de datos</h1>
      <p className="mt-2 text-sm text-foreground/80">Tratamiento de datos personales</p>
      <div className="prose prose-sm mt-6 max-w-none text-foreground/90">
        <p>
          Para usar YAPÓ es necesario que aceptes el uso de tus datos según la Política de Privacidad. En el registro se solicitan consentimientos específicos (login social, perfil, comunicaciones, verificación y biometría cuando aplique).
        </p>
        <p className="mt-4">
          Podés revocar consentimientos desde tu perfil o contactando a soporte. La revocación no afecta la licitud del tratamiento previo.
        </p>
      </div>
      <p className="mt-8">
        <Link href="/home" className="font-medium text-yapo-blue underline">Volver al inicio</Link>
      </p>
    </main>
  );
}
