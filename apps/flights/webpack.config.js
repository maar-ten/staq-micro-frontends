const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { merge } = require('webpack-merge');

module.exports = (config) => {
  return merge(config, {
    optimization: {
      runtimeChunk: false,
    },
    experiments: {
      outputModule: true,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'flights',
        filename: 'remoteEntry.js',
        exposes: {
          './Module': 'apps/flights/src/app/app.tsx',
        },
        library: {
          type: 'module',
        },
      }),
    ],
  });
};
