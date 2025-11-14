import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // เพิ่มขีดจำกัดขนาดไฟล์เป็น 10MB
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '172.16.58.230',
      },
    ],
  },
  // เพิ่มส่วนนี้
  allowedDevOrigins: ['172.16.58.104'],

};

export default nextConfig;
