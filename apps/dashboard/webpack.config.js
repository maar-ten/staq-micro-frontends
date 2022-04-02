const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { merge } = require('webpack-merge');

module.exports = (config) =>
  merge(config, {
    optimization: {
      runtimeChunk: false,
    },
    experiments: {
      outputModule: true,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'dashboard',
        filename: 'remoteEntry.js',
        exposes: {
          './Module': 'apps/dashboard/src/app/app.element.ts',
        },
        library: {
          type: 'module',
        },
      }),
    ],
  });
