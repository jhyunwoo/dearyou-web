/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dearu-pocket.moveto.kr",
        port: "",
        pathname: "/api/files/**",
      },
    ],
  },
};

module.exports = nextConfig;
