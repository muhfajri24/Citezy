import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    poweredByHeader: false,
    allowedDevOrigins: [
        "localhost",
        "127.0.0.1",
        "192.168.2.59",
        "192.168.56.1",
    ],
};

export default nextConfig;
