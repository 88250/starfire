/**
 * @fileoverview webpack config.
 *
 * @version 0.1.0.0, Apr 29, 2019
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const baseConfig = {
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist'),
  },
  entry: {
    'index.js': './src/ts/index.ts',
    'init.js': './src/ts/init.ts',
    'detail.js': './src/ts/detail.ts',
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss', 'pug'],
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ['pug-loader'],
      },
      {
        test: /\.scss$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('autoprefixer')({grid: true, remove: false}),
              ],
            },
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/env',
                {
                  targets: {
                    browsers: [
                      'last 2 Chrome major versions',
                      'last 2 Firefox major versions',
                      'last 2 Safari major versions',
                      'last 2 Edge major versions',
                      'last 2 iOS major versions',
                      'last 2 ChromeAndroid major versions',
                    ],
                  },
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.svg$/,
        include: [path.resolve(__dirname, './src/assets/icons')],
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['index.js'],
      filename: './index.html',
      template: './src/pug/index.pug',
    }),
    new HtmlWebpackPlugin({
      chunks: ['init.js'],
      filename: './init.html',
      template: './src/pug/init.pug',
    }),
    new HtmlWebpackPlugin({
      chunks: ['detail.js'],
      filename: './detail.html',
      template: './src/pug/detail.pug',
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
    // config.plugins.push(new CopyPlugin([
    //   {from: 'src/assets/images/icon', to: 'src/assets/images/icon'},
    //   {from: 'src/js/libs', to: 'src/js/libs'},
    // ]))
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