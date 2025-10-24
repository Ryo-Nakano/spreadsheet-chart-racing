const path = require("path");
const GasPlugin = require("gas-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  mode: "development",
  devtool: false,

  output: {
    path: path.join(__dirname, "dist"),
    filename: 'main.js',
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
      autoGlobalExportsFiles: ['**/*.js'],
    }),
  ],
};
