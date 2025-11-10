const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/buy-now-mfe.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'buy-now-mfe.js',
    library: {
      name: 'BuyNowMFE',
      type: 'umd'
    },
    globalObject: 'this',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ],
  devServer: {
    port: 3001,
    hot: true,
    liveReload: false,
    client: {
      logging: 'warn',
      overlay: false,
      reconnect: 3
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    allowedHosts: 'all',
    compress: true
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
  // React and ReactDOM are now bundled (no externals needed)
};
