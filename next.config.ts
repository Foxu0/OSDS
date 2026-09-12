import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/coordinator/:path*',
        destination: '/dashboard-redirect',
        permanent: false,
      },
      {
        source: '/judge/:path*',
        destination: '/dashboard-redirect',
        permanent: false,
      },
      {
        source: '/student/:path*',
        destination: '/dashboard-redirect',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
