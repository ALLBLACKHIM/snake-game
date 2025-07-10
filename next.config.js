/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes and Socket.IO
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
