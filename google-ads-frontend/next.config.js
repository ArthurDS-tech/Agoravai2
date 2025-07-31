/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Permitir warnings durante o build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Permitir warnings de TypeScript durante o build
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig