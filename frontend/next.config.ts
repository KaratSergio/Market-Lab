import type { NextConfig } from "next";

const withNextIntl = require('next-intl/plugin')(
  './src/core/utils/i18n/request.ts'
);

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = withNextIntl(nextConfig);
export default nextConfig;
