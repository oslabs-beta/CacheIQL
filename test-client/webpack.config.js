const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { default: test } = require('node:test');
module.exports = {
  mode: 'development',
  entry: './src/client/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  devServer: {
    port: '8080',
    static: {
      directory: path.join(__dirname, './dist'),
    },
    open: true,
    hot: true,
    liveReload: true,
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx|jsx|js)$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
      filename: './index.html',
    }),
  ],
};
