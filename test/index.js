var rfile = require('require-file');
var content = rfile('./source.jsx');

var transform = require('../index-transform');

console.log('transformed:');
console.log(transform({
    "next": {
		"transform": "next/lib/${member-lowercase}",
		"preventFullImport": true,
		"style": "next/lib/${member-lowercase}/index.scss"
    },
    "mext": {
		"transform": "mext/lib/${member-lowercase}",
		"preventFullImport": true,
		"style": "mext/lib/${member-lowercase}/index.scss"
	}
})(content));
