/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Turbopack settings
  turbopack: {
    root: 'C:\\Users\\Esteban\\Desktop\\proyectos\\doctorcar',
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
