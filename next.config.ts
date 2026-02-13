import type { NextConfig } from "next";

/**
 * Configuración única para localhost, Vercel y ngrok.
 * Todo se decide por variables de entorno (ver .env.example y README).
 * Sin ifs hardcodeados por entorno; Edge compatible; WebRTC y APIs estándar.
 */
// App Router: activo por defecto con src/app (Next 16). experimental.appDir ya no es necesario.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // reactCompiler desactivado: puede causar pantalla en blanco si no está correctamente configurado (babel-plugin-react-compiler)
  reactCompiler: false,
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
