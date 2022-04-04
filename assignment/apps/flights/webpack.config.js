const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const { merge } = require('webpack-merge');
const share = mf.share;

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
        shared: share({
          react: {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            includeSecondaries: true,
          },
          'react-dom': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            includeSecondaries: true,
          },
          rxjs: {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            includeSecondaries: true,
          },
        }),
      }),
    ],
  });
};
