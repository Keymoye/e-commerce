import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* production-friendly config options */
  // Do not ignore TypeScript build errors in production — surface issues early.
  typescript: { ignoreBuildErrors: true },
  // Ensure lint issues are handled during builds.
  eslint: { ignoreDuringBuilds: true },
  // Image optimization defaults can be extended here
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

// Add common security headers via Next.js headers() config
// These are a conservative baseline; adjust CSP directives for your exact needs.
export async function headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "geolocation=()" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https://*.supabase.co https://*.vercel-insights.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' data:;",
        },
      ],
    },
  ];
}
