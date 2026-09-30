import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mammoth", "unpdf"],
  async redirects() {
    return [{ source: "/achat", destination: "/abonnement", permanent: true }];
  },
};

export default nextConfig;
