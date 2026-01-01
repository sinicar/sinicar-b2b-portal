/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable RTL support
    i18n: {
        locales: ['ar', 'en'],
        defaultLocale: 'ar',
        localeDetection: true,
    },
}

module.exports = nextConfig
