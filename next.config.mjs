/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => [
    {
      source: '/webhook',
      destination: '/api/webhook/subscribe', // Map to the "subscribe" function
    },
    {
      source: '/instagram',
      destination: '/api/webhook/instagram', // Map to the "instagram" function
    },
  ],
};


export default nextConfig;
