const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WatchTimePlugin = require('webpack-watch-time-plugin');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (env, argv) => {
  let config = {
    watch: true,
    entry: {
      //twig: './src/twig.js',
      style: './src/scss.js',
      script: './src/js/scripts.js',
    },
    output: {
      filename: 'js/[name].js',
      chunkFilename: 'js/[name].js?ver=[chunkhash]',
      path: path.resolve(__dirname, 'assets'),
      publicPath: '/wp-content/themes/sthmtwenty/assets',
    },
    resolve: {
      extensions: ['*', '.js'],
    },
    mode: 'development',
    performance: {
      hints: false,
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.twig$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                context: 'src',
                name: '[path][name].[ext]',
              },
            },
            { loader: 'extract-loader' },
            {
              loader: 'html-loader',
              options: {
                minimize: false,
                interpolate: true,
                attrs: ['img:src', 'link:href'],
              },
            },
          ],
        },
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/env'],
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                path: path.resolve(__dirname, 'assets/css'),
                publicPath: '/wp-content/themes/sthmtwenty/assets/css',
              },
            },
            'css-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|tiff|webp|gif|ico|woff|woff2|eot|ttf|otf|mp4|webm|wav|mp3|m4a|aac|oga)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                context: 'src',
                name: '[path][name].[ext]?ver=[md5:hash:8]',
              },
            },
          ],
        },
      ],
    },
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        chunkFilename: 'css/[id].css',
        path: path.resolve(__dirname, 'assets'),
      }),
      new WatchTimePlugin(),
    ],
  };

  if (argv.mode !== 'production') {
    config.module.rules.push({
      test: /\.s?css$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [autoprefixer({})],
            sourceMap: true,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
          },
        },
      ],
    });
  }

  if (argv.mode === 'production') {
    config.module.rules.push({
      test: /\.s?css$/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [
              cssnano({
                preset: 'default',
              }),
              autoprefixer({}),
            ],
            sourceMap: true,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            precision: 10,
          },
        },
      ],
    });

    config.module.rules.push({
      test: /\.svg$/,
      enforce: 'pre',
      use: [
        {
          loader: 'svgo-loader',
          options: {
            precision: 2,
            plugins: [
              {
                removeViewBox: false,
              },
            ],
          },
        },
      ],
    });
  }

  return config;
};