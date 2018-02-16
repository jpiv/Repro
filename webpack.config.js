const path = require('path');

module.exports = {
	entry: './app.js',
	output: {
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			core: path.resolve('UI/core')
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
						'babel-preset-es2015',
						'babel-preset-stage-0',
					]
				}
			}
		]
	}
};
