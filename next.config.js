/** @type {import('next').NextConfig} */

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})

module.exports = withPWA({
  reactStrictMode: true,
  siteUrl: "https://dearyou.moveto.kr",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dearyouapi.moveto.kr",
        port: "",
        pathname: "/api/files/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8090",
        pathname: "/api/files/**",
      },
    ],
  },
})
