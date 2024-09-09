/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => [
        {
            source: '/webhook',
            destination: '/api/webhook',
        },
    ],
};


export default nextConfig;
