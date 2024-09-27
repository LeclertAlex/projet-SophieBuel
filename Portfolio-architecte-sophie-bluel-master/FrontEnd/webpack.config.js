const path = require('path');

module.exports = {
  entry: './assets/script.js',  // Ton fichier JavaScript principal
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 9001  // Change à un autre port comme 9001 ou 8080
  },
  resolve: {
    extensions: ['.js']
  },
  mode: 'development'  // Change à 'production' pour la version finale
  
};