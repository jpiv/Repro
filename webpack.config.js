module.exports = {
	entry: './app.js',
	output: {
		filename: 'bundle.js'
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
						'babel-preset-es2015'
					]
				}
			}
		]
	}
};
