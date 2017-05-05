'use strict';

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var dts = require('dts-bundle');
var rimraf = require('rimraf');
var GenerateJsonPlugin = require('generate-json-webpack-plugin');
var packageJson = require('./package.json');
var fs = require('fs');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var configs = require('./config');


module.exports = function(options) {
    var packagePath = './'+options.buildType+'/';
    var extractCSS = new ExtractTextPlugin({ filename: packagePath + 'surveyeditor.css' });

    var percentage_handler = function handler(percentage, msg) {
        if ( 0 == percentage ) {
            console.log('Build started... good luck!');
        } else if ( 1 == percentage ) {
           
        }
    };
    var config = {
        entry: {
            'surveyeditor': path.resolve(__dirname, './src/entries/index.ts')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.scss'],
            alias: {
                tslib:  path.join(__dirname, './src/entries/helpers.ts')
            }
        },
        module: {
        	 loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                fallbackLoader: 'style',
                loader: 'css',
                publicPath: '../'
                    })
                },
            ],
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: 'ts-loader',
                    options: {
                        compilerOptions: {
                            'declaration': options.buildType === 'test',
                            'outDir': packagePath + 'typings/'
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    loader: extractCSS.extract({
                        fallbackLoader: 'style-loader',
                        loader: 'css-loader!sass-loader'
                    })
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader'
                },
                {
                    test: /\.svg/,
                    use: {
                        loader: 'url-loader',
                        options: {}
                    }
                }
            ]
        },
        output: {
            filename: packagePath +'js/'+'[name].js',
            library: 'SurveyEditor',
            libraryTarget: 'umd',
            umdNamedDefine: true
        },
        externals: {
            'jquery': {
                root: 'jQuery',
                commonjs2: 'jquery',
                commonjs: 'jquery',
                amd: 'jquery'
            },
            'knockout': {
                root: 'ko',
                commonjs2: 'knockout',
                commonjs: 'knockout',
                amd: 'knockout'
            },
            'bootstrap': {
                root: 'bootstrap',
                commonjs2: 'bootstrap',
                commonjs: 'bootstrap',
                amd: 'bootstrap'
            },
            'survey-knockout': {
                root: 'Survey',
                commonjs2: 'survey-knockout',
                commonjs: 'survey-knockout',
                amd: 'survey-knockout'
            }
        },
        plugins: [
        	//复制
	         new CopyWebpackPlugin([
		            {
		                from: './src/pages',
		                to:packagePath
		            },
		
		        ], {
		            ignore: [],
		            copyUnmodified: true,
		        }),          
            extractCSS
        ],
        // 配置 webpack-dev-server
	   	devServer:{
			contentBase:packagePath,
			historyApiFallback: true,
			inline: true,
			port: configs.dev.port // 修改端口，一般默认是8080
		},
        devtool: 'inline-source-map'
    };
       config.plugins = config.plugins.concat([
            new webpack.LoaderOptionsPlugin({ debug: true})
        ]);
    return config;
};