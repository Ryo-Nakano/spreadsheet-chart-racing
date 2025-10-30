const path = require("path");
const GasPlugin = require("gas-webpack-plugin");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = {
  entry: {
    main: './src/index.js',
    chart: './src/ui/index.js',
  },
  mode: "development",
  devtool: false,

  output: {
    path: path.join(__dirname, "dist"),
    filename: '[name].js',
  },

  resolve: {
    modules: [
      path.resolve('./src'),
      "node_modules",
    ],
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      }
    ],
  },

  plugins: [
    new GasPlugin({
      autoGlobalExportsFiles: ['./src/index.js'],
    }),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          'echo "<script>" > dist/chart.js.html && cat dist/chart.js >> dist/chart.js.html && echo "</script>" >> dist/chart.js.html'
        ],
        blocking: true,
        parallel: false
      }
    })
  ],
};
