const path = require('path');

module.exports = {
	entry: {
		app_bundle: './app.js',
		popup_bundle: './popup/popup.js'
	},
	mode: 'development',
	devtool: false,
	output: {
		filename: '[name].js',
		path: __dirname,
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			core: path.resolve('UI/core'),
			utils: path.resolve('utils'),
			views: path.resolve('UI/views'),
			SD: path.resolve('SequenceDriver'),
		}
	},
	module: {
		rules: [
			{
				test: /\.*css$/,
				exclude: [/node_modules/],
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: true
						}	
					},
					'sass-loader',
				],
			},
			{
				test: /\.js(x|$)/,
				exclude: [/node_modules/],
				loader: 'babel-loader',
				options: {
					presets: [
						'babel-preset-react',
						['babel-preset-env', { targets: { chrome: 60 } }],
						'babel-preset-stage-0',
					]
				}
			}
		]
	}
};
