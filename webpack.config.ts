import { Configuration } from 'webpack';
import path from 'path';

const webpackConfig: Configuration = {
  entry: {
    main: path.resolve(__dirname, './src/main.ts')
  },
  mode: 'production',
  devtool: 'source-map',
  externals: ["axios", "fp-ts", "io-ts", "tslib"],
  output: {
    libraryTarget: 'commonjs2',
    library: 'io-ts-api-client',
    path: path.resolve(__dirname, './dist')
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/, 
        loader: "ts-loader"
      }
    ]
  }
}

export default webpackConfig;