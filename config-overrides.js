const webpack = require('webpack');
// const version = require('./package.json').version;

// const versionData = {
//   version: version,
//   timestamp: Date.now(),
//   mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
// };

module.exports = function override(config) {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

  // add fallback for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    constants: require.resolve('constants-browserify'),
    os: false, //require.resolve("os-browserify/browser"),
    timers: false, // require.resolve("timers-browserify"),
    zlib: require.resolve('browserify-zlib'),
    fs: false,
    module: false,
    tls: false,
    net: false,
    readline: false,
    child_process: false,
    buffer: require.resolve('buffer/'),
    vm: require.resolve('vm-browserify'),
  };

  // add externals
  config.externals = {
    ...config.externals,
    solc: 'solc',
  };

  // add public path
  config.output.publicPath = '/';

  // set filename
  // config.output.filename = `[name].${versionData.version}.${versionData.timestamp}.js`;
  // config.output.chunkFilename = `[name].${versionData.version}.${versionData.timestamp}.js`;

  // add copy & provide plugin
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      url: ['url', 'URL'],
      process: 'process/browser',
    }),
  );

  // souce-map loader
  config.module.rules.push({
    test: /\.js$/,
    use: ['source-map-loader'],
    enforce: 'pre',
  });

  config.ignoreWarnings = [/Failed to parse source map/, /require function/]; // ignore source-map-loader warnings & AST warnings

  config.watchOptions = {
    ignored: /node_modules/,
  };

  return config;
};
