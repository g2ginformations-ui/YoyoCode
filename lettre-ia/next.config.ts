import type { NextConfig } from "next";

// En-têtes de sécurité envoyés avec chaque page : le site ne peut pas être affiché dans le cadre
// d'un autre site (protection contre le « clickjacking »), et le navigateur n'interprète pas les fichiers
// au-delà de leur type déclaré.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["mammoth", "unpdf"],
  async redirects() {
    return [{ source: "/achat", destination: "/abonnement", permanent: true }];
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
