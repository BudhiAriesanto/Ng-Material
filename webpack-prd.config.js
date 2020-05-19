const path = require('path'),
      webpackMerge = require('webpack-merge'),
      defaultConfig = require('./webpack.config'),
      ROOT = defaultConfig.ROOT,
      // bundles_ = path.resolve(defaultConfig.ROOT,''
      log = console.log;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DtsBundle = require('dts-bundle-webpack');
const DtsOptions = require('./dts-options');
const copyFiles = require('copy-webpack-plugin');


// const minifyCSS = false;
// if (!minifyCSS) defaultConfig.config.module.rules[3].use.splice(0,0);

var config = webpackMerge(defaultConfig.config, {
  mode: 'production',
  resolve: {
    alias : {
    }
  },
	externals:[
    function(context, request, callback) {
			if (/^(angular|\$)$/i.test(request)) return callback(null, 'angular');
			if (/^(angular\-ts\-decorators|\$)$/i.test(request) ) {
				return callback(null, "ng.TSDecorators");
			}
      callback();
    }
  ],
  entry: {
    'ng.mat': ['./index.ts'],
    'ng.mat.min': ['./index.ts']
  },
  module : {
		rules : [
			{
					test: /\.(svg|woff|woff2|eot|ttf)$/,
					use: {
							loader: 'file-loader',
							options: {
									name: '/fonts/[name].[ext]'
							}
					}
			}
		]
	},
  optimization: {
    minimizer:[
      new UglifyJsPlugin({
        sourceMap: true,
        include: /\.min\.js$/
      })
    ]
  },
  output: {
    path: path.resolve(path.parse(__dirname).root,'/WEB-Project/xcrepes/www/ngapps/lib'),// path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'assign',
    library: 'ng.Material',
    umdNamedDefine: true,
    globalObject: `window.ng`
  },
  plugins: [
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "./ng.mat.css",
      ignoreOrder: false
    }),
    /*new copyFiles([
      {
        from: path.resolve(ROOT, '/dist/*.js') ,
        to : path.resolve(path.parse(__dirname).root,'/WEB-Project/xcrepes/www/ngapps/lib')

      }
    ])*/
    // new DtsBundle(DtsOptions(ROOT, defaultConfig.log))
  ]
});
module.exports = config;
