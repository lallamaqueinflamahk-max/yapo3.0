import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | YAPÓ",
  description: "Política de privacidad y protección de datos de YAPÓ 3.0",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-yapo-white px-4 py-8 pt-20">
      <h1 className="text-2xl font-bold text-yapo-blue">Política de Privacidad</h1>
      <p className="mt-2 text-sm text-foreground/80">Última actualización: 2025</p>
      <div className="prose prose-sm mt-6 max-w-none text-foreground/90">
        <p>
          YAPÓ 3.0 recoge y trata datos personales conforme a la Ley de Protección de Datos Personales y a esta política.
          Solo utilizamos la información necesaria para ofrecer identidad, reputación y servicios laborales en la plataforma.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-yapo-blue">Datos que recogemos</h2>
        <p>Nombre, correo, foto de perfil (cuando autorizás login social), teléfono y zona (si los completás en el perfil), y datos de verificación cuando activás billetera o roles de confianza.</p>
        <h2 className="mt-6 text-lg font-semibold text-yapo-blue">Uso y conservación</h2>
        <p>Los datos se usan para la gestión de la cuenta, ofertas, chat, billetera y cumplimiento legal. No vendemos datos a terceros. Podés solicitar acceso, rectificación o eliminación contactando a soporte.</p>
      </div>
      <p className="mt-8">
        <Link href="/home" className="font-medium text-yapo-blue underline">Volver al inicio</Link>
      </p>
    </main>
  );
}
