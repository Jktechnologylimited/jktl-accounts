/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com", "graph.microsoft.com"],
  },
};
export default nextConfig;
