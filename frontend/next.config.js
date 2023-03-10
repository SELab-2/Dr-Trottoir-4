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
  }
}

module.exports = nextConfig
