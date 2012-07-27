// scan generators/ for known generators
var fs = require('fs');

var generators = {},
	dir = __dirname + '/',
	me = __filename.substr(dir.length);

// check this directory for all javascript files that aren't this one.
files = fs.readdirSync(__dirname);
files.forEach(function (generator) {
	var path = dir + generator + "/" + generator + ".js";

	if (fs.existsSync(path)) {
		generators[generator] = new (require(path));
	}
});

module.exports = generators;
