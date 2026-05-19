/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  async redirects() {
    return [
      {
        source: "/chapa-pintura-rosario",
        destination: "/chapa-y-pintura/rosario",
        permanent: true,
      },
      {
        source: "/siniestros-rosario",
        destination: "/siniestros/rosario",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
