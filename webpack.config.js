const path = require('path');
const ROOT = path.resolve( __dirname, 'src' );
const webpackMerge = require('webpack-merge');
/** Webpack Plugins */
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
/**  */

var config = webpackMerge({
    context: ROOT,
    resolve: {
        extensions: ['.ts', '.js', '.scss']
    },

    module: {
        noParse: function(content) {
            return false;
        },
        rules: [
            { // 0
                test: /\.ts$/,
                enforce: 'pre',
                exclude: [/node_modules/],
                loader: 'eslint-loader',
                options: {
                    // cache: true,
                    emitError: true,
                    formatter: require('eslint-formatter-pretty')
                }
            },
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use : [
                    {
                        loader: 'babel-loader'
                    }
                ]
            },
            { // 3 test: /\.s[ac]ss$/,
                test: /\.scss$/,
                exclude: [ /node_modules/ ],
                use: [
                    // 'exports-loader?module.exports.toString()',
                    // fallback to style-loader in development
                    {
                        loader : MiniCssExtractPlugin.loader,
                        options : {
                           hmr: false,
                        }
                    },
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: 'file-loader'
            },
            {
                test: /.html$/,
                exclude: /index.html$/,
                use: 'html-loader'
            }
        ]
    },

    plugins: [
        new LoaderOptionsPlugin({
            debug: true,
            minimize: false,
            options: {
                tslint: {
                    configuration: require('./tslint.json'),
                    typeCheck: true
                }
            }
        })
        //new ExtractTextPlugin('./assets/css/style.css'),
    ]
});

module.exports = {
                    config: config,
                    ROOT: ROOT,
                    log: console.log
                };