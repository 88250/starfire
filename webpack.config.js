/**
 * @fileoverview webpack config.
 *
 * @version 0.1.0.0, Apr 29, 2019
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require(
  'webpack-bundle-analyzer').BundleAnalyzerPlugin

const baseConfig = {
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist'),
  },
  entry: {
    'index.js': './src/ts/index.ts',
    'setting.js': './src/ts/setting.ts',
    'detail.js': './src/ts/detail.ts',
    'home.js': './src/ts/home.ts',
  },
  resolve: {
    extensions: ['.ts', '.js', 'pug'],
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ['pug-loader'],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors.js',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['index.js', 'vendors.js'],
      filename: './index.html',
      template: './src/pug/app.pug',
    }),
    new HtmlWebpackPlugin({
      chunks: ['setting.js', 'vendors.js'],
      filename: './setting.html',
      template: './src/pug/app.pug',
    }),
    new HtmlWebpackPlugin({
      chunks: ['detail.js', 'vendors.js'],
      filename: './detail.html',
      template: './src/pug/app.pug',
    }),
    new HtmlWebpackPlugin({
      chunks: ['home.js', 'vendors.js'],
      filename: './home.html',
      template: './src/pug/app.pug',
    }),
  ],
}

const getConfig = (env) => {
  let config
  if (env && env.production) {
    config = Object.assign({}, baseConfig, {
      mode: 'production',
    })
    config.plugins.push(new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.join(__dirname, 'dist')],
    }))
  } else {
    config = Object.assign({}, baseConfig, {
      mode: 'development',
      watch: true,
      devServer: {
        contentBase: path.join(__dirname, '.'),
        port: 9000,
        host: '0.0.0.0',
      },
    })
  }
  return config
}
module.exports = getConfig