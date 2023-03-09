/** @type {{redirects(): Promise<[{permanent: boolean, destination: string, source: string}]>}} */

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
    NEXT_PUBLIC_API_PORT: process.env.NEXT_PUBLIC_API_PORT,
  },
}

module.exports = nextConfig
