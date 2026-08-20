import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.0.1.60",
    "admin.10.0.1.60",
    "driver.10.0.1.60",
  ],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
