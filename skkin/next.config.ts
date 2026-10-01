import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le dossier parent contient un autre projet : on fixe la racine sur celui-ci.
  turbopack: { root: import.meta.dirname },
  experimental: {
    // Les photos produits sont envoyées depuis l'admin via des Server Actions.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
