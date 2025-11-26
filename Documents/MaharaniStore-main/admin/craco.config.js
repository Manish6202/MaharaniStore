module.exports = {
  devServer: {
    allowedHosts: 'all',
    host: 'localhost',
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    client: {
      webSocketURL: 'ws://localhost:3000/ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
      return webpackConfig;
    },
  },
};
