/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/jobs',
        destination: 'https://jobboard-delta.vercel.app/',
      },
      {
        source: '/jobs/:path*',
        destination: 'https://jobboard-delta.vercel.app/:path*',
      },
    ];
  },
};

export default nextConfig;
