/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fantasy.premierleague.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
