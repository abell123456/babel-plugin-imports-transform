var babel = require('babel-core');
var babelFusionPlugin = require('./index');
var extend = require('extend');

var presetsPlugins = [
	require("babel-preset-react"),
	require("babel-preset-decorators-legacy")
];

module.exports = function(opts = {}) {
	return function(content) {
		return babel.transform(content, {
			// 两种presets必须处理掉，否则报错：1、jsx语法；2、ES7 decorator。
			presets: presetsPlugins,
			plugins: [
				[
					babelFusionPlugin, opts
				]
			]
		}).code;
	};
};